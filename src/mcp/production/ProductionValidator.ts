import type { ProductionState } from "../schemas/productionState.schema";
import { canTransitionProductionState } from "../schemas/productionState.schema";
import { reviewGeneratedAsset } from "../review/AssetReview";

export type ProductionValidationResult = {
  ok: boolean;
  reasons: string[];
};

export class ProductionValidator {
  validateTransition(from: ProductionState, to: ProductionState): ProductionValidationResult {
    return canTransitionProductionState(from, to)
      ? { ok: true, reasons: [] }
      : { ok: false, reasons: [`Invalid transition: ${from} -> ${to}`] };
  }

  validateGeneratedAsset(prompt: string, output?: unknown): ProductionValidationResult {
    const review = reviewGeneratedAsset({ prompt, hasImageOutput: Boolean(output) });
    return review.result === "FAIL"
      ? { ok: false, reasons: review.checks.filter((check) => check.level === "FAIL").map((check) => check.message) }
      : { ok: true, reasons: review.checks.filter((check) => check.level === "WARNING").map((check) => check.message) };
  }
}

export const productionValidator = new ProductionValidator();
