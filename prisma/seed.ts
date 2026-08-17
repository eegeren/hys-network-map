import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, DeviceType, DeviceStatus } from "@prisma/client";

const connectionString=process.env.DATABASE_URL;
if(!connectionString) throw new Error("DATABASE_URL gerekli");
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString})});
const catalog=[
  ["BND-ROUTER-01","ROUTER","192.168.1.1","ONLINE"],["BND-SWITCH-01","SWITCH","192.168.1.2","ONLINE"],["BND-POS-01","POS","192.168.1.21","ONLINE"],["BND-POS-02","POS","192.168.1.22","ONLINE"],["BND-OFFICE-01","PC","192.168.1.31","WARNING"],["BND-PRINTER-01","PRINTER","192.168.1.41","ONLINE"],
  ["BIGA-ROUTER-01","ROUTER","192.168.2.1","ONLINE"],["BIGA-POS-01","POS","192.168.2.21","ONLINE"],["BIGA-PC-01","PC","192.168.2.31","ONLINE"],
  ["ERDEK-ROUTER-01","ROUTER","192.168.3.1","ONLINE"],["ERDEK-POS-01","POS","192.168.3.21","OFFLINE"],
] as const;
async function main(){
  const storeDefs=[["Bandırma Köroğlu","BND","Bandırma"],["Biga Köroğlu","BIGA","Biga"],["Erdek Köroğlu","ERDEK","Erdek"]] as const;
  const stores=new Map<string,string>();
  for(const [name,code,city] of storeDefs){const s=await prisma.store.upsert({where:{code},update:{name,city},create:{name,code,city}});stores.set(code,s.id)}
  for(const [name,type,ip,status] of catalog){const code=name.split("-")[0]==="ERDEK"?"ERDEK":name.split("-")[0];await prisma.device.upsert({where:{name},update:{status:status as DeviceStatus},create:{name,hostname:name,type:type as DeviceType,ipAddress:ip,status:status as DeviceStatus,ping:status==="OFFLINE"?0:14,operatingSystem:type==="PC"||type==="POS"?"Windows 11 Pro":"Embedded OS",storeId:stores.get(code)!}})}
}
main().finally(()=>prisma.$disconnect());
