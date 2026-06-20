import fs from 'node:fs'

const cfgPath = './data/autoGroupSign.json'

function loadCfg() {
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  } catch {
    return { hour: 0, minute: 0 }
  }
}

function saveCfg(data) {
  const dir = './data'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const existing = loadCfg()
  fs.writeFileSync(cfgPath, JSON.stringify({ ...existing, ...data }, null, 2))
}

export const supportGuoba = () => ({
  pluginInfo: {
    name: 'auto-group-sign',
    title: '自动群打卡',
    description: '每天定时自动群打卡（支持多Bot）',
    author: '@original',
    link: '',
    isV3: true,
    isV2: false,
    showInMenu: 'auto',
  },
  configInfo: {
    schemas: [
      {
        component: 'SOFT_GROUP_BEGIN',
        label: '自动群打卡',
      },
      {
        component: 'Divider',
        label: '打卡时间',
      },
      {
        field: 'hour',
        label: '时',
        helpMessage: '0~23，每天固定时间打卡',
        component: 'InputNumber',
        componentProps: { min: 0, max: 23, step: 1 },
      },
      {
        field: 'minute',
        label: '分',
        component: 'InputNumber',
        componentProps: { min: 0, max: 59, step: 1 },
      },
      {
        component: 'Divider',
        label: '说明',
      },
      {
        component: 'EXPLAIN',
        label: '',
        explain: '每个Bot独立打卡，防风控间隔1秒\n需Bot为群管理员/群主\n修改后保存即可，无需重启',
      },
    ],
    getConfigData() {
      const cfg = loadCfg()
      return { hour: cfg.hour ?? 0, minute: cfg.minute ?? 0 }
    },
    setConfigData(data, { Result }) {
      saveCfg({ hour: data.hour ?? 0, minute: data.minute ?? 0 })
      return Result.ok({}, '保存成功（下次定时任务执行时生效）')
    },
  },
})
