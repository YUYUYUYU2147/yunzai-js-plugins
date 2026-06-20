import fs from 'node:fs'

const cfgPath = './data/autoGroupName.json'

function loadCfg() {
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  } catch { return {} }
}

function saveCfg(data) {
  const existing = loadCfg()
  const merged = { ...existing, ...data }
  fs.writeFileSync(cfgPath, JSON.stringify(merged, null, 2))
}

export const supportGuoba = () => ({
  pluginInfo: {
    name: 'auto-group-name',
    title: '自动群名片',
    description: '定时更新Bot在各个群的名片，支持多种后缀模板（时间、热搜、一言等）',
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
        label: '自动群名片',
      },
      {
        field: 'enable',
        label: '启用自动更新',
        component: 'Switch',
      },
      {
        field: 'interval',
        label: '更新间隔（分钟）',
        helpMessage: '每隔多少分钟自动更新一次名片',
        component: 'InputNumber',
        componentProps: { min: 1, max: 1440, step: 1 },
      },
      {
        field: 'nickname',
        label: '名片前缀',
        helpMessage: '留空则使用Bot昵称',
        component: 'Input',
        componentProps: { placeholder: '留空自动获取Bot昵称' },
      },
      {
        field: 'userSuffix',
        label: '固定后缀',
        helpMessage: '设置固定后缀后，将不再使用随机模板',
        component: 'Input',
        componentProps: { placeholder: '如：在线中' },
      },
      {
        field: 'notGroup',
        label: '排除的群',
        helpMessage: '不更新这些群的群名片',
        component: 'GTags',
        componentProps: { allowAdd: true, allowDel: true },
      },
    ],
    getConfigData() {
      const cfg = loadCfg()
      return {
        enable: !!cfg.enable,
        interval: cfg.interval ?? 30,
        nickname: cfg.nickname || '',
        userSuffix: cfg.userSuffix || '',
        notGroup: cfg.notGroup || [],
      }
    },
    setConfigData(data, { Result }) {
      const cfg = loadCfg()
      cfg.enable = !!data.enable
      cfg.interval = data.interval ?? 30
      cfg.nickname = data.nickname || ''
      cfg.userSuffix = data.userSuffix || ''
      cfg.notGroup = data.notGroup || []
      saveCfg(cfg)
      return Result.ok({}, '保存成功（需重启生效）')
    },
  },
})
