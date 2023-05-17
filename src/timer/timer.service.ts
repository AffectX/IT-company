import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class TimerService {
  constructor(
    private readonly prismaService: PrismaService,
    private schedulerRegistry: SchedulerRegistry
  ){}

    stopCron(){

    }
;
    
  @Cron('*/10 * * * * *', {name: "handleCron"}, )
  async handleCron() {   
    const START_TIME: Date = new Date(process.env.START);
    const currentDate = new Date();
    const END_TIME: Date = new Date(process.env.END)
    if (END_TIME <= currentDate) {
      this.schedulerRegistry.deleteCronJob('handleCron');
      
      return console.log('Игра завершилась');  
    }
    
   
    if(START_TIME > currentDate) {
      return console.log('Игра еще не началась');  
    }

    const teams = await this.prismaService.team.findMany({
      select:{
        id: true,
        nextTax: true,
        _count:{
          select:{
            member: true
          }
        }
      }
    })
    const hourLater = new Date(currentDate.getTime() + 60 * 60 * 1000); // добавляем 1 час

    
    console.log("Текущая дата", currentDate);

    
    
    const updatedTeam = await this.prismaService.$transaction(
      teams.map( team => {
        if(team.nextTax <= currentDate){
          return this.prismaService.team.update({
            where:{
              id: team.id
            },
            data:{
              money:{
                decrement: Number(process.env.TAX_PER_MEMBER) * team._count.member
              },
              nextTax: hourLater,
              history:{
                create:{
                  value: (Number(process.env.TAX_PER_MEMBER) * team._count.member)*-1
                }
              }
            },
          })
        }
        return this.prismaService.team.findUnique({
          where: {
            id: team.id
          }
        })
      })
    )
    const timeTax = updatedTeam.map(t => t.nextTax)
    console.log("Дата следующего списания", timeTax[0]);

    
  }

}
