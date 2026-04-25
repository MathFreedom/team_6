import { extractBillData } from "@/lib/ml/bill-extraction";
import { sampleLinkyProfile } from "@/lib/mocks/enedis.mock";

export async function runEnedisOnboarding() {
  return sampleLinkyProfile;
}

export async function runOcrOnboarding(file: File) {
  return extractBillData(file);
}
