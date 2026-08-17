import { prisma } from "@/lib/prisma";import { errorResponse,unavailable } from "@/lib/api";
const defaults={id:"system",systemName:"HYS Network Map",timezone:"Europe/Istanbul",dateFormat:"DD.MM.YYYY HH:mm",autoRefresh:30,heartbeatInterval:30,offlineThreshold:90,pingWarning:100,pingCritical:250,cpuWarning:85,ramWarning:90,diskWarning:90,offlineAlerts:true,performanceAlerts:true,pingAlerts:true,alertCooldown:300,agentVersion:"1.0.0",appearance:"SYSTEM"};
export async function GET(){
  if(!prisma)return Response.json({...defaults,agentSecretConfigured:false});
  const settings=await prisma.settings.upsert({where:{id:"system"},update:{},create:defaults});
  const {agentSecretHash,...safeSettings}=settings;
  return Response.json({...safeSettings,agentSecretConfigured:Boolean(agentSecretHash)});
}
export async function PATCH(req:Request){if(!prisma)return unavailable();try{const b=await req.json();delete b.id;delete b.updatedAt;delete b.agentSecretHash;return Response.json(await prisma.settings.upsert({where:{id:"system"},update:b,create:{...defaults,...b}}))}catch(e){return errorResponse(e)}}
