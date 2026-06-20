import schedule from 'node-schedule'

const SECOND = 0
const MINUTE = 0
const HOUR = 0
const cronTime = `${SECOND} ${MINUTE} ${HOUR} * * *`

export class autoGroupSignMulti extends plugin {
  constructor() {
    super({
      name: '自动群打卡(多Bot)',
      dsc: '每天定时自动群打卡（支持多Bot）',
      event: 'message',
      priority: 5000,
    })
  }

  async init() {
    const bots = Bot?.bots && typeof Bot.bots === 'object' ? Object.keys(Bot.bots) : []
    const ids = new Set([String(Bot.uin), ...bots])

    for (const uid of ids) {
      schedule.scheduleJob(`${cronTime}_${uid}`, cronTime, async () => {
        await this.doSign(uid)
      })
    }
    logger.mark(`[自动群打卡] 已为 ${ids.size} 个Bot设置定时任务: ${cronTime}`)
  }

  async doSign(uid) {
    const bot = Bot[uid] || Bot
    if (!bot) return

    try {
      const res = await bot.sendApi('get_group_list')
      const groups = res?.data || (Array.isArray(res) ? res : [])
      if (!groups.length) return

      let count = 0
      for (const g of groups) {
        const gid = g.group_id
        if (!gid) continue
        try {
          const r = await bot.sendApi('send_group_sign', { group_id: gid })
          if (r?.retcode === 0) count++
          await new Promise(r => setTimeout(r, 1000))
        } catch (e) {
          logger.warn(`[自动群打卡][${uid}] 群 ${gid} 打卡失败: ${e.message}`)
        }
      }
      logger.mark(`[自动群打卡][${uid}] 完成 ${count}/${groups.length} 个群`)
    } catch (err) {
      logger.error(`[自动群打卡][${uid}] 异常:`, err)
    }
  }
}
