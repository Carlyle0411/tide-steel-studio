export type MasterVideoCategory = "人物" | "机甲" | "潮兽" | "环境" | "机械细节" | "转场";
export type MasterVideoTemplate = {
  id: string; name: string; category: MasterVideoCategory; description: string; tags: string[];
  firstFramePrompt: string; endFramePrompt: string; videoPrompt: string;
  duration: number; camera: string; usage: string; status: "可用" | "修订中";
  referenceAssets?: string[];
  createdAt: string; updatedAt: string;
};
export type MasterVideoImages = Record<string, { first?: string; end?: string }>;

const DATA_KEY = "tide-steel-master-video-library-v1";
const LINKS_KEY = "tide-steel-master-video-shot-links-v1";
const EVENT = "tide-steel-master-video-library-change";
const DB = "tide-steel-master-video-images";
const STORE = "images";

export function loadMasterVideoTemplates(): MasterVideoTemplate[] { try { const value = JSON.parse(localStorage.getItem(DATA_KEY) ?? "null"); return Array.isArray(value) ? value : seeds(); } catch { return seeds(); } }
export function saveMasterVideoTemplate(template: MasterVideoTemplate) { const values = loadMasterVideoTemplates(); const index = values.findIndex(item => item.id === template.id); const next = { ...template, updatedAt: new Date().toISOString() }; if (index >= 0) values[index] = next; else values.push(next); persist(values); }
export function createMasterVideoTemplate(category: MasterVideoCategory): MasterVideoTemplate { const values = loadMasterVideoTemplates(); const prefix = prefixOf(category); const number = Math.max(0, ...values.filter(item=>item.id.startsWith(`MVL-${prefix}-`)).map(item=>Number(item.id.split("-").at(-1))||0)) + 1; const now = new Date().toISOString(); const value: MasterVideoTemplate = { id:`MVL-${prefix}-${String(number).padStart(3,"0")}`, name:"未命名可复用片段", category, description:"说明这个片段在故事中的可复用动作。", tags:[category,"待完善"], firstFramePrompt:"描述动作开始前的清晰首帧，主体身份与结构锁定。", endFramePrompt:"描述动作完成后的清晰尾帧，保持同一主体、机位与环境。", videoPrompt:"保持参考图主体一致，动作具有准备、执行、承重和余波；摄影机运动克制，真实物理，不改变人物身份、机甲结构或潮兽身体。", duration:5, camera:"35mm，缓慢推进", usage:"三部曲通用", status:"修订中", createdAt:now, updatedAt:now }; values.push(value); persist(values); return value; }
export async function deleteMasterVideoTemplate(id:string){const values=loadMasterVideoTemplates().filter(item=>item.id!==id);persist(values);const images=await loadMasterVideoImages();delete images[id];await saveImages(images);}
export function subscribeMasterVideoLibrary(callback:()=>void){window.addEventListener(EVENT,callback);window.addEventListener("storage",callback);return()=>{window.removeEventListener(EVENT,callback);window.removeEventListener("storage",callback)}}
export async function loadMasterVideoImages():Promise<MasterVideoImages>{const db=await openDb();return new Promise((resolve,reject)=>{const request=db.transaction(STORE,"readonly").objectStore(STORE).get("library");request.onsuccess=()=>resolve(request.result?.value??{});request.onerror=()=>reject(request.error)})}
export async function setMasterVideoImage(id:string,kind:"first"|"end",file:File){if(!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("仅支持 PNG、JPG、WEBP");const images=await loadMasterVideoImages();images[id]={...(images[id]??{}),[kind]:await dataUrl(file)};await saveImages(images);window.dispatchEvent(new Event(EVENT));}
export function loadMasterVideoShotLinks():Record<string,string>{try{return JSON.parse(localStorage.getItem(LINKS_KEY)??"{}")}catch{return{}}}
export function linkMasterVideoToShot(shotId:string,templateId:string){const links=loadMasterVideoShotLinks();links[shotId]=templateId;localStorage.setItem(LINKS_KEY,JSON.stringify(links));window.dispatchEvent(new Event(EVENT));}
export function getTemplateReferenceAssets(template: MasterVideoTemplate) { return template.referenceAssets?.length ? template.referenceAssets : referenceMap[template.id] ?? categoryReferences[template.category]; }

function persist(values:MasterVideoTemplate[]){localStorage.setItem(DATA_KEY,JSON.stringify(values));window.dispatchEvent(new Event(EVENT))}
function prefixOf(category:MasterVideoCategory){return ({人物:"HUM",机甲:"MECH",潮兽:"CRE",环境:"ENV",机械细节:"MEC",转场:"TRANS"} as const)[category]}
function dataUrl(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:"id"});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function saveImages(value:MasterVideoImages){const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put({id:"library",value});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}

function seeds():MasterVideoTemplate[]{const now="2026-07-12T00:00:00.000Z";return [
  seed("MVL-HUM-001","人物克制回头","人物","人物听见画外异常后缓慢回头，不立刻做惊讶表情。","人物中近景，身体仍朝前，眼睛先移向画外，头部尚未转动；同一人物、服装和环境。","同机位，头部转至约45度，视线锁定画外，嘴唇闭合，肩颈轻微绷紧。","眼睛先移动，停半拍后头部跟随，肩膀最后产生轻微转动；自然眨眼一次，呼吸连续，不张嘴，不夸张皱眉。","50mm固定中近景，极慢推进",4,"角色发现异常、关系反应镜头",["人物","回头","情绪"]),
  seed("MVL-HUM-002","驾驶员同步呼吸","人物","驾驶员在高压同步中用呼吸恢复控制。","驾驶舱近景，人物咬紧后槽牙，肩膀抬高，双手握住控制器，冷蓝系统光稳定。","同一构图，肩膀落下一点，手指恢复稳定，视线重新聚焦前方。","人物短促吸气，停半拍，再缓慢呼气；肩颈随呼吸真实起伏，手指从僵硬变为稳定，不喊叫，不改变脸和驾驶服。","85mm近景，摄影机固定",5,"驾驶舱压力、同步恢复",["人物","驾驶","呼吸"]),
  seed("MVL-HUM-003","工业通道奔跑","人物","角色在潮湿基地通道中受控奔跑。","人物位于通道远端，身体前倾准备起跑，一只脚刚离地，工业灯与积水方向清晰。","同一人物从摄影机侧前方经过，脚掌落入浅水，衣料和装备因惯性滞后。","真实跑步周期，重心前移，脚掌落地后身体承重；呼吸急促但不喊叫，衣料、挂件与水花具有不同惯性。","35mm侧后方跟拍，轻微可读手持",5,"基地召回、撤离、行动段落",["人物","奔跑","基地"]),
  seed("MVL-HUM-004","指挥官停笔倾听","人物","经验型指挥官察觉系统尚未识别的低频。","指挥官侧坐在监听台，笔尖仍接触记录板，系统界面显示正常。","笔已停下，右手离开记录板，头部向监听设备侧转，眉间仅轻微收紧。","先停笔，再放慢呼吸，最后侧头倾听；不震惊、不突然站起。若说话，以低沉平稳语气说“把原始声道给我”。","50mm中近景，缓慢推进",5,"异常建立、指挥判断",["人物","陈牧","监听"]),
  seed("MVL-MECH-001","重型机甲承重落脚","机甲","20米级工业机甲完成具有重量反馈的一步。","机甲脚掌悬在积水上方，液压杆伸展，脚趾结构保持锁定。","脚掌压入地面，水被水平推开，膝部液压回缩，机体重心下沉。","脚掌先下降，接触后液压系统压缩，重量从脚掌传到膝髋，水体随后向外扩散；禁止轻盈跳落和无重量水花。","50mm低机位固定",4,"机甲启动、行走、登场",["机甲","落脚","重量"]),
  seed("MVL-MECH-002","背部驾驶舱开启","机甲","机甲背部液压舱门按工程顺序开启。","暗红背部装甲完全闭合，锁扣和维修接口清晰，冷凝水缓慢下落。","同一结构的锁扣全部释放，舱门打开，内部冷蓝同步光照出狭窄入口。","锁扣由下至上依次释放，舱门先松动再由液压臂缓慢推开，蒸汽从密封边缘排出；结构不得增生或变形。","35mm低机位，极慢推进",5,"驾驶员进入、启动仪式",["机甲","驾驶舱","开启"]),
  seed("MVL-MECH-003","机甲低重心冲锋","机甲","重型机甲在暴雨中穿过海防闸口加速。","机甲低重心起步，前脚承重，后脚推进，暴雨方向和闸口结构清晰。","同一机体穿过闸口，前脚重落，水幕被腿部推向两侧，装甲结构完整。","每一步包含抬脚、前移、落地承重和推进器补偿；机体不飞行，装甲不变形，雨水与水花按速度产生滞后。","35mm侧后方低机位跟拍",5,"战斗进入、抢险冲刺",["机甲","冲锋","暴雨"]),
  seed("MVL-MECH-004","机甲拳头承重支撑","机甲","机甲用拳头支撑建筑而非攻击。","巨大拳头接近变形墙体，手指关节尚未接触，撤离通道位于下方。","拳头抵住墙体，腕部液压受压，碎屑少量落下，车辆从指缝下通过。","手臂先寻找支点，再逐级承重；腕部和肩部出现机械颤动，墙体停止继续变形，禁止挥拳、爆炸和英雄姿势。","24mm低机位固定",6,"城市救援、文明主题",["机甲","救援","承重"]),
  seed("MVL-MECH-005","链刃逐节启动","机械细节","等离子链刃完成可信的机械解锁与点亮。","右臂链刃折叠，锁扣闭合，雨水沿黑色机械骨架流下。","锁扣全部咬合，刀刃边缘出现克制的蓝白等离子光，周围雨水轻微汽化。","锁扣逐节解锁并展开，机械结构先到位，能源再从根部向尖端点亮；禁止凭空变形和过量能量爆炸。","85mm机械特写，缓慢横移",4,"武器启动、战争逻辑",["机甲","武器","链刃"]),
  seed("MVL-CRE-001","白潮水下掠过","潮兽","巨大深海生命在水下经过但不完整露出。","低能见度海水中只有模糊白影，浮游物按正常水流移动。","白色甲壳局部从画面下方掠过，浮游物被压力推开，主体仍不完整。","白潮以深海生物的连续压力推进移动，不使用鱼类摆尾；甲壳经过后水体产生延迟回流，禁止咆哮和冲镜头。","24mm水下固定远景",6,"未知建立、潮兽首次暗示",["潮兽","白潮","水下"]),
  seed("MVL-CRE-002","潮兽海面局部显现","潮兽","环境先改变，随后仅露出一片甲壳。","暴雨海面和探照灯正常扫动，远处水纹出现不自然收束。","一片巨大白色甲壳短暂穿过浪面，海水沿壳片落下，完整身体仍不可见。","先让浪向改变，再让局部甲壳缓慢顶出水面，停留不足一秒后沉下；不张嘴、不咆哮、不做Boss登场。","35mm长焦固定",5,"未知升级、首次接触",["潮兽","海面","局部"]),
  seed("MVL-CRE-003","白潮低频回应","潮兽","白潮通过壳片共振回应赤霆。","白潮头颈稳定，壳片闭合，周围雨水和海面仍在运动。","壳片从前向后产生一轮细微振动，附近水纹扩散，头部没有攻击动作。","多层壳片按顺序轻微振动，低频通过水体传播；动作表现疼痛与定位，不拟人化，不眨眼示好。","85mm长焦压缩距离",5,"非战争证据、交流伏笔",["潮兽","白潮","低频"]),
  seed("MVL-ENV-001","海面反向起纹","环境","正常海面出现难以察觉的反向规律。","杭州湾阴天远景，浮标和海防设备正常，海纹向岸传播。","同一机位，极远处一圈细小海纹反向向中心收束，其余秩序不变。","海浪保持自然随机运动，只有远处窄小区域逐渐反向收束；异常不发光，不形成漩涡或巨浪。","24mm固定远景",6,"潮汐异常、章节开场",["环境","海洋","异常"]),
  seed("MVL-ENV-002","巨型观测闸关闭","环境","工程闸门缓慢关闭并切断最后海光。","闸门完全开启，外部冷灰海光穿过巨大开口，人物在下方很小。","闸门接近闭合，只剩一条竖直海光，人物保持原位，动作已经无法撤回。","多段闸门依次承重闭合，速度缓慢且稳定，最后海光逐渐变窄；禁止快速剪闸、爆炸和警报灯堆砌。","24mm固定广角",7,"选择代价、章节结尾",["环境","闸门","关闭"]),
  seed("MVL-ENV-003","基地警报进入","环境","正常工作中的基地逐层进入警戒。","深蓝基地通道维持冷蓝工作光，人员按岗位移动。","同一空间的应急红光按区域依次点亮，人员停半拍后转入预案路线。","冷蓝灯保持，红色警报从远到近逐段进入；工作人员各自反应，不同时回头，不奔逃尖叫。","35mm缓慢横移",5,"危机升级、场景转换",["环境","基地","警报"]),
  seed("MVL-ENV-004","深海悬浮物逆流","环境","潮门附近的悬浮物停止后逆向运动。","深海压力边界前，颗粒和悬浮物按同一洋流缓慢漂移。","悬浮物先静止，再从边缘向压力边界逆向聚集，边界结构不发光。","所有颗粒不是同时转向；近处先停，远处稍后响应，形成可读的压力传播，禁止虫洞和紫色能量。","24mm水下固定镜头",6,"潮门建立、物理异常",["环境","潮门","深海"]),
  seed("MVL-MEC-001","液压系统承重","机械细节","重型机械从空载进入承重状态。","液压杆伸展，金属表面有水汽和盐雾，压力表稳定。","液压杆压缩，软管轻微绷紧，接缝渗出一缕蒸汽，压力表上升。","先接触负载，再缓慢压缩；软管、螺栓和机架按不同幅度产生细微振动，禁止塑料质感。","85mm微距固定",4,"机甲、闸门、升降平台通用",["机械","液压","承重"]),
  seed("MVL-TRANS-001","声波匹配转场","转场","用相似波形连接海面与系统屏幕。","海面长波横向穿过画面，低饱和冷灰光。","画面保持相同波形位置，转为监听屏幕上的冷蓝低频曲线。","以波形轮廓完成匹配剪辑，不使用闪白或粒子转场；海浪声在切换后变成监听底噪。","固定构图，后期匹配剪辑",3,"海洋到指挥中心转场",["转场","匹配剪辑","声波"]),
  seed("MVL-TRANS-002","雨滴到冷凝水转场","转场","用同方向水滴连接外景与机库。","暴雨水滴从装甲边缘向下坠落，背景虚化。","同一画面位置变为机库管线上的冷凝水滴，落入积水。","保持水滴运动方向和速度连续，在落下瞬间匹配切换；不使用溶解、闪光或数字特效。","85mm微距固定",3,"外景到基地转场",["转场","水滴","匹配剪辑"])
];}
function seed(id:string,name:string,category:MasterVideoCategory,description:string,firstFramePrompt:string,endFramePrompt:string,videoPrompt:string,camera:string,duration:number,usage:string,tags:string[]):MasterVideoTemplate{return{id,name,category,description,firstFramePrompt,endFramePrompt,videoPrompt,duration,camera,usage,tags,status:"可用",referenceAssets:referenceMap[id]??categoryReferences[category],createdAt:"2026-07-12T00:00:00.000Z",updatedAt:"2026-07-12T00:00:00.000Z"}}
const categoryReferences: Record<MasterVideoCategory,string[]>={人物:["角色资产库：对应人物标准头像","角色资产库：对应人物核心三视图","角色资产库：对应人物服装全身参考"],机甲:["机甲资产库：赤霆01核心三视图","机甲资产库：赤霆01对应结构细节","场景资产库：对应机库或海防环境"],潮兽:["怪兽资产库：白潮核心三视图","怪兽资产库：白潮头部或甲壳细节","场景资产库：对应海面或深海环境"],环境:["场景资产库：对应场景标准远景","天气资产库：对应天气参考","灯光资产库：对应真实光源参考"],机械细节:["机甲资产库：赤霆01核心三视图","机甲资产库：对应局部结构细节","材质资产库：湿金属与海盐腐蚀参考"],转场:["场景资产库：转场起始画面","场景资产库：转场结束画面","镜头资产库：匹配构图参考"]};
const referenceMap:Record<string,string[]>={
  "MVL-HUM-001":["角色资产库：林舟/标准头像（锁定脸型与左眉伤痕）","角色资产库：林舟/核心三视图（锁定头部转向）","角色资产库：林舟/驾驶服全身（锁定服装）"],
  "MVL-HUM-002":["角色资产库：林舟/标准头像","角色资产库：林舟/驾驶舱坐姿","机甲资产库：赤霆01/驾驶舱内部"],
  "MVL-HUM-003":["角色资产库：林舟/工业通道奔跑","角色资产库：林舟/驾驶服全身","场景资产库：深蓝基地/驾驶员工业通道"],
  "MVL-HUM-004":["角色资产库：陈牧/标准头像","角色资产库：陈牧/指挥制服半身","场景资产库：深蓝基地/指挥中心"],
  "MVL-MECH-001":["机甲资产库：赤霆01/核心三视图","机甲资产库：赤霆01/腿部结构","场景资产库：深蓝基地/赤霆机库"],
  "MVL-MECH-002":["机甲资产库：赤霆01/完整背面","机甲资产库：赤霆01/驾驶舱开启","场景资产库：深蓝基地/赤霆机库"],
  "MVL-MECH-003":["机甲资产库：赤霆01/核心三视图","机甲资产库：赤霆01/暴雨低重心冲锋","场景资产库：杭州湾海防闸口"],
  "MVL-MECH-004":["机甲资产库：赤霆01/左臂战损","机甲资产库：赤霆01/拳头撑墙","场景资产库：海防撤离通道/撤离车辆"],
  "MVL-MECH-005":["机甲资产库：赤霆01/右臂链刃细节","机甲资产库：赤霆01/核心三视图","材质资产库：湿金属与雨水参考"],
  "MVL-CRE-001":["怪兽资产库：白潮/核心三视图","怪兽资产库：白潮/游泳姿态","场景资产库：深海压力环境"],
  "MVL-CRE-002":["怪兽资产库：白潮/甲壳细节","怪兽资产库：白潮/海雾局部显现","场景资产库：杭州湾海防线/暴雨警戒"],
  "MVL-CRE-003":["怪兽资产库：白潮/头部结构","怪兽资产库：白潮/低鸣壳片振动","机甲资产库：赤霆01/驾驶舱局部"],
  "MVL-ENV-001":["场景资产库：杭州湾海防线/阴天正常世界","天气资产库：阴天海雾","镜头资产库：24mm海防远景"],
  "MVL-ENV-002":["场景资产库：巨型观测闸/关闭状态","角色资产库：陈牧/指挥制服半身","镜头资产库：24mm建筑广角"],
  "MVL-ENV-003":["场景资产库：深蓝基地/指挥中心","灯光资产库：基地冷蓝光","灯光资产库：应急红光"],
  "MVL-ENV-004":["场景资产库：潮门/海底压力边界远景","场景资产库：潮门/边界逆流近景","特效资产库：深海悬浮颗粒"],
  "MVL-MEC-001":["机甲资产库：赤霆01/腿部结构","场景资产库：深蓝基地/赤霆维修平台","材质资产库：湿金属与海盐腐蚀"],
  "MVL-TRANS-001":["场景资产库：杭州湾海防线/阴天正常世界","道具资产库：AI澜/冷蓝标准界面","镜头资产库：波形匹配构图"],
  "MVL-TRANS-002":["机甲资产库：赤霆01/装甲细节","场景资产库：深蓝基地/赤霆机库","镜头资产库：85mm水滴微距"]
};
