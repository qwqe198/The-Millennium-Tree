function d(n) {
    return new Decimal(n)
}

addLayer("m", {
    name: "分钟", // 可选，仅在少数地方使用。如果省略，则使用层级ID。
    symbol: "M", // 显示在层级节点上。默认是ID的首字母大写
    position: 0, // 在行中的水平位置。默认使用层级ID并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(60), // 可以是一个函数，考虑需求增加
    resource: "分钟", // 声望货币的名称
    baseResource: "秒", // 声望基于的资源名称
    baseAmount() {return player.points}, // 获取当前基础资源的数量
    type: "normal", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    exponent: 1, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        if (hasUpgrade("m", 12))
            mult = mult.mul(upgradeEffect("m", 12))
        mult = mult.mul(tmp.h.effect)
        mult = mult.mul(tmp.d.effect)
        mult = mult.mul(tmp.mo.effect)
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    effect: () => player.m.points.add(1).cbrt(),
    effectDescription: () => `将秒增益提升 ${format(tmp.m.effect)} 倍`,
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    row: 0, // 层级在树中的行（0是第一行）
    upgrades: {
        11: {
            title: "分钟",
            description: "不知道，比如分钟提升秒？",
            cost: d(2),
            effect: () => player.m.points.add(2.25).log(1.5),
            effectDisplay: () => `x${format(player.m.points.add(2.25).log(1.5))}`
        },
        12: {
            title: "十二分钟",
            description: "分钟提升分钟",
            cost: d(12),
            effect: () => player.m.points.add(2).log(2),
            effectDisplay: () => `x${format(player.m.points.add(2).log(2))}`,
            unlocked: () => hasUpgrade("m", 11)
        }
    },
    passiveGeneration: () => {
        if (player.a.paused) return 0
        if (hasMilestone("h", 1)) return 5
        return hasMilestone("h", 0) ? 0.05 : 0
    },
    update(diff) {
        if (hasMilestone("mo", 0) && !player.a.paused) {
            player.m.points = player.m.points.add(d(1).mul(diff))
        }
    },
    autoUpgrade: () => hasMilestone("h", 0),
    hotkeys: [
        {key: "m", description: "m: 重置以获取分钟", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("h", {
    name: "小时", // 可选，仅在少数地方使用。如果省略，则使用层级ID。
    symbol: "H", // 显示在层级节点上。默认是ID的首字母大写
    position: 0, // 在行中的水平位置。默认使用层级ID并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f0932b",
    requires: new Decimal(60), // 可以是一个函数，考虑需求增加
    base: d(10),
    resource: "小时", // 声望货币的名称
    baseResource: "分钟", // 声望基于的资源名称
    baseAmount() {return player.m.points}, // 获取当前基础资源的数量
    type: "static", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    exponent: 0.75, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        if (hasMilestone("h", 2))
            mult = mult.div(tmp.h.milestonesH2Eff)
        return mult
    },
    directMult: () => {
        let mult = tmp.d.effect.mul(tmp.mo.effect)
        if (hasMilestone("mo", 3)) {
            mult = mult.mul(tmp.mo.milestonesCnt)
        } 
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    effect: () => player.h.points.add(1).sqrt(),
    effectDescription: () => `提升分钟和秒 ${format(tmp.h.effect)} 倍`,
    row: 1, // 层级在树中的行（0是第一行）
    hotkeys: [
        {key: "h", description: "h: 重置以获取小时", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestonesH2Eff() {
        if (player.m.points.lte(d(1e10))) return d(1)
        return player.m.points.div(d("1e10")).sqrt()
    },
    milestones: {
        0: {
            requirementDescription: "5 小时",
            effectDescription: "神奇地自动化分钟。",
            done() { return player.h.points.gte(5) || hasMilestone("mo", 4) || hasMilestone("y", 0) }
        },
        1: {
            requirementDescription: "再 5 小时",
            effectDescription: "神奇地自动化分钟，但效果提升了 100 倍。",
            done() { return player.h.points.gte(10) || hasMilestone("mo", 4) || hasMilestone("y", 0) },
            unlocked: () => hasMilestone("h", 0)
        },
        2: {
            requirementDescription: "4 x 5 小时",
            effectDescription: () => `超过 1e10 分钟的分钟数会降低小时需求，当前为 x${format(tmp.h.milestonesH2Eff)}<br>
                我知道 1e10 分钟已经是 317 年了，但没关系`,
            done() { return player.h.points.gte(20) || hasMilestone("mo", 4) || hasMilestone("y", 0) },
            unlocked: () => hasMilestone("h", 1)
        },
    },
    canBuyMax: () => true,
    autoPrestige: () => hasMilestone("mo", 6),
    resetsNothing: () => hasMilestone("mo", 6),
    layerShown(){return true},
    branches: [["m", "white", 4]]
})

addLayer("d", {
    name: "天", // 可选，仅在少数地方使用。如果省略，则使用层级ID。
    symbol: "D", // 显示在层级节点上。默认是ID的首字母大写
    position: 0, // 在行中的水平位置。默认使用层级ID并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        reset_countdown: 0
    }},
    color: "#eb4d4b",
    requires: new Decimal(24), // 可以是一个函数，考虑需求增加
    resource: "天", // 声望货币的名称
    baseResource: "小时", // 声望基于的资源名称
    baseAmount() {return player.h.points}, // 获取当前基础资源的数量
    type: "normal", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    exponent: 1, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        mult = mult.mul(tmp.mo.effect)
        mult = mult.mul(tmp.mo.globalBoost)
        return mult
    },
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    row: 2, // 层级在树中的行（0是第一行）
    hotkeys: [
        {key: "d", description: "d: 重置以获取天", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    milestones: {
        0: {
            requirementDescription: "一个惊喜",
            effectDescription: "此层级不会重置任何内容。<br>—— 否则游戏会太长！让我们缩短它。",
            done() { return player.d.points.gte(1) || hasMilestone("y", 0) },
            unlocked: () => player.d.points.gte(1)
        },
        1: {
            requirementDescription: "如此多的天 (1e70)",
            effectDescription: () => `天提升 <b>这完全有效</b> 时间。当前为 x${format(tmp.d.days2GlobalBoost)}`,
            done() { return player.d.points.gte(d("1e70")) },
            unlocked: () => player.y.points.gte(10)
        },
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            if (player.d.reset_countdown > 0) {
                return `${format(player.d.reset_countdown)}秒重置冷却`
            }
        }],
        "blank",
        "milestones",
        "blank",
    ],
    onPrestige() {
        if (hasMilestone("mo", 3)) {
            player.d.reset_countdown = 15
        } else {
            player.d.reset_countdown = 30
        }
    },
    canReset() {
        if (player.d.reset_countdown > 0) return false
        return tmp.d.baseAmount.gte(tmp.d.requires)
    },
    update(diff) {
        if (player.d.reset_countdown >= 0 && !player.a.paused) {
            player.d.reset_countdown -= diff
        }
    },
    days2GlobalBoost: () => {
        if (hasUpgrade("y", 12)) {
            return player.d.points.add(2).log(2).add(2).log(2).add(2).log(2)
        }
        return player.d.points.add(2).log(2).add(2).log(2).add(2).log(2).add(2).log(2)
    },
    effect: () => player.d.points.add(2).div(2).sqrt(),
    effectDescription: () => `提升所有之前的时间货币 ${format(tmp.d.effect)} 倍`,
    resetsNothing: true,
    passiveGeneration: () => hasMilestone("mo", 7) && !player.a.paused ? d(1) : d(0),
    layerShown(){return true},
    branches: [["h", "white", 4]]
})

addLayer("mo", {
    name: "月", // 可选，仅在少数地方使用。如果省略，则使用层级ID。
    symbol: "Mo", // 显示在层级节点上。默认是ID的首字母大写
    position: 0, // 在行中的水平位置。默认使用层级ID并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#be2edd",
    requires: new Decimal(30), // 可以是一个函数，考虑需求增加
    resource: "月", // 声望货币的名称
    base: () => d(20).sub(tmp.mo.milestonesJuneEff),
    baseResource: "天", // 声望基于的资源名称
    baseAmount() {return player.d.points}, // 获取当前基础资源的数量
    type: "static", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    exponent: 1, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    directMult: () => tmp.mo.globalBoost,
    effect: () => player.mo.points.add(1).pow(1.5),
    effectDescription: () => `有一些 <em>强大的效果</em>，如 x${format(tmp.mo.effect)}`,
    row: 3, // 层级在树中的行（0是第一行）
    hotkeys: [
        {key: "o", description: "o: 重置以获取月", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax: false,
    milestonesCnt: () => {
        let cnt = 0
        for (let i = 0; i < 12; i++) {
            if (hasMilestone("mo", i)) {
                cnt += 1
            }
        }
        return d(cnt)
    },
    milestonesJuneEff: () => {
        if (!hasMilestone("mo", 5)) return d(0)
        return tmp.mo.milestonesCnt.sub(4)
    },
    milestones: {
        0: {
            requirementDescription: "一月",
            effectDescription: "你每秒被动获得 1 分钟<br>（这很合理）",
            done() { return player.mo.points.gte(1) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(1)
        },
        1: {
            requirementDescription: "二月",
            effectDescription: "没有效果，因为 <em>强大的效果</em> 太 <em>强大</em> 了",
            done() { return player.mo.points.gte(2) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(2)
        },
        2: {
            requirementDescription: "三月",
            effectDescription: "<em>强大</em>",
            done() { return player.mo.points.gte(3) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(3)
        },
        3: {
            requirementDescription: "四月",
            effectDescription: () => `仍然 <em>强大</em>，但天冷却时间减半，提升小时的月里程碑（x${format(tmp.mo.milestonesCnt)})`,
            done() { return player.mo.points.gte(4) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(4)
        },
        4: {
            requirementDescription: "五月",
            effectDescription: () => `重置时保留小时的里程碑`,
            done() { return player.mo.points.gte(5) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(5)
        },
        5: {
            requirementDescription: "六月",
            effectDescription: () => `略微减少月需求基础值（-${format(tmp.mo.milestonesJuneEff)})`,
            done() { return player.mo.points.gte(6) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(6)
        },
        6: {
            requirementDescription: "七月",
            effectDescription: () => `自动化小时且不重置任何内容。`,
            done() { return player.mo.points.gte(7) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(7)
        },
        7: {
            requirementDescription: "八月",
            effectDescription: () => `被动获得 100% 的天。`,
            done() { return player.mo.points.gte(8) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(8)
        },
        8: {
            requirementDescription: "九月",
            effectDescription: () => `哦，已经是九月了`,
            done() { return player.mo.points.gte(9) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(9)
        },
        9: {
            requirementDescription: "十月",
            effectDescription: () => `我今年还没完成任何计划`,
            done() { return player.mo.points.gte(10) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(10)
        },
        10: {
            requirementDescription: "十一月",
            effectDescription: () => `哦不，这一年要结束了`,
            done() { return player.mo.points.gte(11) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(11)
        },
        11: {
            requirementDescription: "十二月",
            effectDescription: () => `它来了`,
            done() { return player.mo.points.gte(12) || hasMilestone("y", 0) },
            unlocked: () => player.mo.points.gte(12)
        },
        12: {
            requirementDescription: "第 10000 个月",
            effectDescription: () => `月提升 <b>这完全有效</b> 时间。当前为 x${format(tmp.mo.months2GlobalBoost)}`,
            done() { return player.mo.points.gte(10000) },
            unlocked: () => player.mo.points.gte(10000)
        }
    },
    clickables: {
        11: {
            display() {
                return `如果你在手机上玩，长按此处进行月重置`
            },
            unlocked: () => player.y.points.gte(2),
            onHold: () => {
                doReset("mo")
            },
            canClick: () => true
        }
    },
    layerShown(){return true},
    months2GlobalBoost: () => {
        if (hasUpgrade("y", 12)) {
            return player.mo.points.add(2).log(2).add(2).log(2)
        }
        return player.mo.points.add(2).log(2).add(2).log(2).add(2).log(2)
    },
    globalBoost() {
        // 好吧，它不应该在这里，但我不在乎
        if (!hasMilestone("a", 1)) return d(1)
        return d(2).pow(player.a.global_boost_time.div(90))
    },
    resetsNothing: () => hasMilestone("y", 1),
    canBuyMax: () => hasMilestone("y", 3),
    autoPrestige: () => hasMilestone("y", 4),
    branches: [["d", "white", 4]]
})

addLayer("y", {
    name: "年", // 可选，仅在少数地方使用。如果省略，则使用层级ID。
    symbol: "Y", // 显示在层级节点上。默认是ID的首字母大写
    position: 0, // 在行中的水平位置。默认使用层级ID并按字母顺序排序
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4834d4",
    requires: new Decimal(12), // 可以是一个函数，考虑需求增加
    resource: "年", // 声望货币的名称
    baseResource: "月", // 声望基于的资源名称
    baseAmount() {return player.mo.points}, // 获取当前基础资源的数量
    type: "static", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    base: d(2),
    exponent: 1, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    milestones: {
        0: {
            requirementDescription: "一年",
            effectDescription: "所有之前层级的里程碑将永久保留。",
            done() { return player.y.points.gte(1) },
            unlocked: () => player.y.points.gte(1)
        },
        1: {
            requirementDescription: "3 年",
            effectDescription: `我不想再看到那些里程碑弹窗了！<br>
                月不会重置任何内容。`,
            done() { return player.y.points.gte(3) },
            unlocked: () => player.y.points.gte(1)
        },
        2: {
            requirementDescription: "4 年",
            effectDescription: `年不再重置 <b>这完全有效</b> 时间。`,
            done() { return player.y.points.gte(4) },
            unlocked: () => player.y.points.gte(3)
        },
        3: {
            requirementDescription: "7 年",
            effectDescription: `你可以购买最大月。`,
            done() { return player.y.points.gte(7) },
            unlocked: () => player.y.points.gte(5)
        },
        4: {
            requirementDescription: "十年",
            effectDescription: `月和年都将自动化。`,
            done() { return player.y.points.gte(10) },
            unlocked: () => player.y.points.gte(7)
        },
        5: {
            requirementDescription: "已经是 2000 年了吗？？？",
            effectDescription: "一切都太快了。将所有速度减慢 100 倍",
            done() { return player.y.points.gte(2000) },
            unlocked: () => player.y.points.gte(2000)
        },
        6: {
            requirementDescription: "哦不，已经是 2020 年了",
            effectDescription: "一切都太快了！！！再次将所有速度减慢 10 倍",
            done() { return player.y.points.gte(2020) },
            unlocked: () => player.y.points.gte(2020)
        },
        7: {
            requirementDescription: "不，请不要！！！",
            effectDescription: "减慢所有速度",
            done() { return player.y.points.gte(2024) },
            unlocked: () => player.y.points.gte(2024)
        },
    },
    upgrades: {
        11: {
            title: "3 个十年",
            description: "年不再重置任何内容，并自动购买最大。",
            cost: d(30),
            unlocked: () => player.y.points.gte(10)
        },
        12: {
            title: "6 个十年",
            description: "<b>这完全有效</b> 时间的效果更好",
            cost: d(60),
            unlocked: () => player.y.points.gte(40)
        },
        13: {
            title: "一个世纪",
            description: "为什么不这样做：游戏速度x10",
            cost: d(100),
            onPurchase() { player.devSpeed = player.devSpeed * 10 },
            unlocked: () => player.y.points.gte(100)
        },
    },
    autoPrestige: () => hasMilestone("y", 4),
    doReset() {
        if (!hasMilestone("y", 2))
            player.a.global_boost_time = d(0)
    },
    row: 4, // 层级在树中的行（0是第一行）
    hotkeys: [
        {key: "y", description: "y: 重置以获取年", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax: () => hasUpgrade("y", 11),
    resetsNothing: () => hasUpgrade("y", 11),
    layerShown(){return true},
    branches: [["mo", "white", 4]]
})

addLayer("a", {
    name: "成就",
    symbol: "A",
    position: 0,
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            paused: false,
            global_boost_time: d(0)
        }
    },
    color: "#ffffff",
    requires: new Decimal(1), // 可以是一个函数，考虑需求增加
    resource: "成就", // 声望货币的名称
    baseResource: "点数", // 声望基于的资源名称
    baseAmount() {return player.points}, // 获取当前基础资源的数量
    type: "none", // normal: 获得货币的成本取决于获得的量。static: 成本取决于已有量
    exponent: 1, // 声望货币的指数
    gainMult() { // 计算来自奖励的主货币乘数
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // 计算来自奖励的主货币指数
        return new Decimal(1)
    },
    row: "side", // 层级在树中的行（0是第一行）
    milestones: {
        0: {
            requirementDescription: "好吧，这不会起作用",
            done() {return player.points.gte(10)},
            effectDescription: "游戏速度x6",
            onComplete() {player.devSpeed = 6}
        },
        1: {
            requirementDescription: "这完全有效",
            done() {return player.y.points.gte(1)},
            effectDescription: () => `时间被动地极大地提升一切，x${format(tmp.mo.globalBoost)}`,
            onComplete() { player.global_boost_time = 0 },
            unlocked() {return player.y.points.gte(1)},
        }
    },
    update(diff) {
        if (hasMilestone("a", 1) && !player.a.paused) {
            let add_diff = d(diff)
            if (hasMilestone("mo", 12))
                add_diff = add_diff.mul(tmp.mo.months2GlobalBoost)
            if (hasMilestone("d", 1))
                add_diff = add_diff.mul(tmp.d.days2GlobalBoost)

            if (hasMilestone("y", 5))
                add_diff = add_diff.div(100)
            
            if (hasMilestone("y", 6))
                add_diff = add_diff.div(10)

            if (hasMilestone("y", 7))
                add_diff = add_diff.div(2)
            player.a.global_boost_time = player.a.global_boost_time.add(add_diff)
        }
    },
    tabFormat: ["milestones"],
    hotkeys: [{
        key: "w",
        description: "w: 暂停/恢复游戏",
        onPress() { player.a.paused = !player.a.paused }
    }],
    layerShown(){ return hasMilestone("a", 0) }
})