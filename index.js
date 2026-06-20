import schedule from 'node-schedule'
import fs from 'node:fs'

const cfgPath = './data/autoGroupSign.json'

function loadCfg() {
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  } catch {
    const cfg = { hour: 0, minute: 0 }
    fs.mkdirSync('./data', { recursive: true })
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
    return cfg
  }
}

async function doSign(uid) {
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

async function tick() {
  const cfg = loadCfg()
  const now = new Date()
  if (now.getHours() !== cfg.hour || now.getMinutes() !== cfg.minute) return

  const bots = Bot?.bots && typeof Bot.bots === 'object' ? Object.keys(Bot.bots) : []
  const ids = new Set([String(Bot.uin), ...bots])
  for (const uid of ids) await doSign(uid)
}

const JOB_NAME = 'auto-group-sign-check'
if (schedule.scheduledJobs[JOB_NAME]) schedule.scheduledJobs[JOB_NAME].cancel()
schedule.scheduleJob(JOB_NAME, '* * * * *', tick)

export class autoGroupSign extends plugin {
  constructor() {
    super({
      name: '自动群打卡',
      dsc: '每天定时自动群打卡（支持多Bot）',
      event: 'message',
      priority: 5000,
    })
  }
}
