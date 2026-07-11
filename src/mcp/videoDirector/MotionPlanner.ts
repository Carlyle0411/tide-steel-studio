export function planMotion(shotDescription: string) {
  const environmentMotion = /海|storm|wave|雨|浪/i.test(shotDescription) ? "ocean wave movement, rain mist, distant buoy drift" : "subtle atmospheric movement";
  const characterMotion = /陈牧|林舟|许燃/i.test(shotDescription) ? "small human reaction, controlled turn, no theatrical gesture" : "none";
  const mechaMotion = /赤霆|mecha/i.test(shotDescription) ? "heavy idle mechanical pressure, no hero pose" : "none";
  const creatureMotion = /白潮|潮兽/i.test(shotDescription) ? "partial underwater displacement, no full reveal unless approved" : "none";
  return { environmentMotion, characterMotion, mechaMotion, creatureMotion };
}
