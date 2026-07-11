import { directorEngine } from "../director/DirectorEngine";
import { referenceManager } from "../reference/ReferenceManager";
import { productionScheduler } from "./ProductionScheduler";
import { productionExecutor } from "./ProductionExecutor";
import { productionValidator } from "./ProductionValidator";
import { mcpLogger } from "../logs/mcpLogger";

export type ProductionOrchestratorInput = {
  episodeId: string;
  shotId: string;
  directionApproved: boolean;
  autoRun?: boolean;
};

export class ProductionOrchestrator {
  async createProductionShot(input: ProductionOrchestratorInput) {
    if (!input.directionApproved) {
      const error = "Director Review must be approved before production execution.";
      mcpLogger.warn({ scope: "workflow", message: "Production shot blocked", reason: error, input });
      throw new Error(error);
    }

    const directorPackage = directorEngine.generateDirectorPrompt(input.episodeId, input.shotId);
    const referencePack = referenceManager.buildReferencePack(
      input.episodeId,
      input.shotId,
      directorPackage.finalPrompt,
      directorPackage.negativePrompt
    );
    const transition = productionValidator.validateTransition("approved_direction", "generating");
    if (!transition.ok) throw new Error(transition.reasons.join("; "));

    const task = productionScheduler.scheduleImageGeneration({
      episodeId: input.episodeId,
      shotId: input.shotId,
      prompt: referencePack.mainPrompt,
      negativePrompt: referencePack.negativePrompt,
      referenceImages: referencePack.referenceImages
    });

    if (input.autoRun) {
      return productionExecutor.execute(task);
    }
    return task;
  }
}

export const productionOrchestrator = new ProductionOrchestrator();
