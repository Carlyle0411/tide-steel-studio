export function planCameraMovement(shotDescription: string) {
  if (/establishing|远景|开场|防线|海面/i.test(shotDescription)) return "slow push in";
  if (/人物|陈牧|林舟|许燃/i.test(shotDescription)) return "restrained tracking";
  if (/机甲|赤霆/i.test(shotDescription)) return "low angle slow tilt";
  return "locked-off cinematic hold";
}
