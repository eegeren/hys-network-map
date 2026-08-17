import { Prisma } from "@prisma/client";

export function unavailable(){ return Response.json({error:"Database bağlantısı yapılandırılmamış."},{status:503}) }
export function errorResponse(error:unknown){
  if(error instanceof Prisma.PrismaClientKnownRequestError){
    if(error.code==="P2002") return Response.json({error:"Bu benzersiz değer zaten kullanılıyor."},{status:409});
    if(error.code==="P2025") return Response.json({error:"Kayıt bulunamadı."},{status:404});
    if(error.code==="P2003") return Response.json({error:"Bu kayıt bağlı veriler nedeniyle silinemiyor."},{status:409});
  }
  console.error(error); return Response.json({error:"İşlem tamamlanamadı."},{status:500});
}
export const text=(v:unknown)=>typeof v==="string"?v.trim():"";
export const number=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:undefined;
