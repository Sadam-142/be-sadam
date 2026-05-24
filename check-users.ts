import bcrypt from "bcryptjs";

const hash1 = "$2b$10$girC.Y69nGxPTOe7Mp.uMuW4GmJOZhQQV0XJ8sBcSiukc3ELYHQqa";
const plain1 = "Risalah2208096085";

async function test() {
  const match = await bcrypt.compare(plain1, hash1);
  console.log(`Password ${plain1} matches hash:`, match);
  
  const altMatch = await bcrypt.compare("risalah123", hash1);
  console.log(`Password risalah123 matches hash:`, altMatch);
}

test().catch(console.error);
