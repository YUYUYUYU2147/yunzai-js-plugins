import fs from 'node:fs'
import path from 'node:path'

const _path = process.cwd()
const cfgPath = path.join(_path, 'data', 'box', 'config.json')

const ALL_OPTIONS = [
  'QQ号', '昵称', '备注', '群昵称', '群头衔', '性别',
  '生日', '星座', '生肖', '年龄', '血型', '电话', '邮箱',
  '家乡', '现居', '职业', '个性标签', '风险账号', '机器人账号',
  'QQVIP', '年VIP', 'VIP等级', '群等级', '加群时间', 'QQ等级',
  '注册时间', '签名'
]

function loadCfg() {
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  } catch {
    return {}
  }
}

function saveCfg(data) {
  const dir = path.dirname(cfgPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const existing = loadCfg()
  const merged = { ...existing, ...data }
  fs.writeFileSync(cfgPath, JSON.stringify(merged, null, 2))
}

export const supportGuoba = () => {
  return {
    pluginInfo: {
      name: 'example-box',
      title: 'QQ资料卡片',
      description: '以卡片形式展示QQ用户资料',
      author: '@Zhalslar',
      authorLink: 'https://github.com/Zhalslar',
      link: 'https://github.com/Zhalslar/astrbot_plugin_box',
      isV3: true,
      isV2: false,
      showInMenu: 'auto',
    },
    configInfo: {
      schemas: [
        {
          component: 'Divider',
          label: '权限设置',
        },
        {
          field: 'only_admin',
          label: '仅管理员可开盒他人',
          helpMessage: '开启后普通成员只能开盒自己',
          component: 'Switch',
        },
        {
          field: 'protect_ids',
          label: '保护名单',
          helpMessage: '被保护的用户不会被开盒（Bot和Bot管理员默认已保护）',
          component: 'GTags',
          componentProps: { allowAdd: true, allowDel: true },
        },
        {
          field: 'recall_time',
          label: '撤回时间（秒）',
          helpMessage: '0 表示不撤回',
          component: 'InputNumber',
          componentProps: { min: 0, max: 120, step: 1 },
        },
        {
          component: 'Divider',
          label: '信息显示选项',
        },
        ...ALL_OPTIONS.map(label => ({
          field: `display_options.${label}`,
          label,
          component: 'Switch',
        })),
        {
          component: 'Divider',
          label: '自动开盒（进群）',
        },
        {
          field: 'autobox.enter',
          label: '进群自动开盒',
          component: 'Switch',
        },
        {
          field: 'autobox.white_groups',
          label: '白名单群',
          helpMessage: '只自动开盒白名单的群，不填则所有群都启用',
          component: 'GTags',
          componentProps: { allowAdd: true, allowDel: true },
        },
        {
          component: 'Divider',
          label: '自动开盒（退群）',
        },
        {
          field: 'autobox.exit',
          label: '退群自动开盒',
          component: 'Switch',
        },
      ],
      getConfigData() {
        const cfg = loadCfg()
        const data = {}
        data.only_admin = !!cfg.only_admin
        data.protect_ids = cfg.protect_ids || []
        data.recall_time = cfg.recall_time ?? 0
        data.autobox = {
          enter: !!cfg.autobox?.enter,
          exit: !!cfg.autobox?.exit,
          white_groups: cfg.autobox?.white_groups || [],
        }
        for (const label of ALL_OPTIONS) {
          const enabled = cfg.display_options || ALL_OPTIONS
          data[`display_options.${label}`] = enabled.includes(label)
        }
        return data
      },
      setConfigData(data, { Result }) {
        const cfg = loadCfg()
        cfg.only_admin = !!data.only_admin
        cfg.protect_ids = data.protect_ids || []
        cfg.recall_time = data.recall_time ?? 0
        cfg.autobox = {
          enter: !!data.autobox?.enter,
          exit: !!data.autobox?.exit,
          white_groups: data.autobox?.white_groups || [],
        }
        cfg.display_options = ALL_OPTIONS.filter(label => data[`display_options.${label}`])
        saveCfg(cfg)
        return Result.ok({}, '保存成功')
      },
    },
  }
}
