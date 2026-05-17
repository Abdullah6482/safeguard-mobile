export const CameraModes = {
  FLASH_AUTO: 'auto',
  FLASH_ON: 'on',
  FLASH_OFF: 'off',
  LENS_BACK: 'back',
  LENS_FRONT: 'front',
};

export function toggleFlash(current) {
  if (current === CameraModes.FLASH_AUTO) return CameraModes.FLASH_ON;
  if (current === CameraModes.FLASH_ON) return CameraModes.FLASH_OFF;
  return CameraModes.FLASH_AUTO;
}
