export function isAllowedBillType(fileType: string) {
  return ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(fileType);
}

