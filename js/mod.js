let modInfo = {
	name: "千禧树",
	id: "CatfishMillennium",
	author: "catfish",
	pointsName: "秒",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // 用于硬重置和新玩家
	offlineLimit: 0,  // 离线限制，单位为小时
}

// 设置版本号和版本名称
let VERSION = {
	num: "1",
	name: "全部完成",
}

let changelog = `<h1>更新日志:</h1><br>
	<h3>v0.0</h3><br>
		- 添加了所有内容。<br>`

let winText = `恭喜！您已到达2025年并完成了游戏，但暂时就这样吧...`

// 如果您在某个层级中添加了新函数，并且这些函数在调用时会产生效果，请将它们添加到这里。
// （这里的是一些示例，所有官方函数已经处理完毕）
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// 确定是否显示点数/秒
function canGenPoints(){
	return !player.a.paused
}

// 计算点数/秒！
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	gain = gain.mul(tmp.m.effect)
	gain = gain.mul(tmp.h.effect)
	gain = gain.mul(tmp.d.effect)
	gain = gain.mul(tmp.mo.effect)
	gain = gain.mul(tmp.mo.globalBoost)
	if (hasUpgrade("m", 11))
		gain = gain.mul(upgradeEffect("m", 11))
	return gain
}

// 您可以在这里添加与层级无关的变量，这些变量将存入“player”并保存，同时设置默认值
function addedPlayerData() { return {
}}

// 在页面顶部显示额外内容
var displayThings = [
	() => {
		if (player.a.paused) return "游戏已暂停（按w键继续）"
	},
	
	() => {
		return "达到2025年以完成游戏！"
	}
]

// 确定游戏何时“结束”
function isEndgame() {
	return player.y.points.gte(new Decimal(2025))
}


// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}