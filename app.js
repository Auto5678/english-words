/* 初中英语背单词 - 业务逻辑与数据存储
 * 依据 system-design.md v1.1 实现。
 * 模块在浏览器中作为普通脚本执行，在 Node 中可 require 用于测试。
 */
(function (global) {
'use strict';

/* 应用代码版本（与 sw.js 的 CACHE 对应）。
 * 排障用：华为浏览器地址栏访问 app.js 搜此常量即可确认平板实际运行的版本。 */
const APP_VERSION = 'v1.3.0';

/* ======================================================
 * 1. 内置数据：学年、单元、单词、奖励、文章
 * ====================================================== */

const GRADES = [
  { id: 'gPri', title: '小学' },
  { id: 'g7a', title: '七年级上册' },
  { id: 'g7b', title: '七年级下册' },
  { id: 'g8a', title: '八年级上册' },
  { id: 'g8b', title: '八年级下册' },
  { id: 'g9a', title: '九年级上册' },
  { id: 'g9b', title: '九年级下册' },
];

/* 由 build-wordlib.js 生成，勿手改 */
/* 由 build-wordlib.js 生成，勿手改 */
const GRADE_G7A_UNIT_TITLES = ["Starter Unit 1","Starter Unit 2","Starter Unit 3","Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7"];

const GRADE_PRI_UNIT_TITLES = ["Starter Unit 1","Starter Unit 2","Starter Unit 3","Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7","数词 · 基数词","数词 · 序数词","月份","星期"];

const RAW_WORDS_G7A = {
  'g7a-u1': [
    ['unit', 'n.', '单元', '/ˈjuːnɪt/'],
    ['starter unit', '', '过渡单元', '/ˈstɑːtə(r)/'],
    ['section', 'n.', '部分；地区', '/ˈsekʃn/'],
    ['greet', 'v.', '招呼；问候', '/ɡriːt/'],
    ['Helen', '', '海伦', '/ˈhelən/'],
    ['Ella', '', '埃拉', '/ˈelə/'],
    ['Emma', '', '埃玛', '/ˈemə/'],
    ['Peter', '', '彼得', '/ˈpiːtə(r)/'],
    ['spell', 'v.', '用字母拼；拼写', '/spel/'],
    ['Brown', '', '布朗', '/braʊn/'],
    ['PLA', 'abbr.', '中国人民解放军', '/ˌpiːelˈeɪ/'],
    ['VR', 'abbr.', '虚拟现实', '/ˌviːˈɑː(r)/'],
    ['CD', 'abbr.', '光盘', '/ˌsiːˈdiː/'],
    ['PRC', 'abbr.', '中华人民共和国', '/ˌpiːɑː(r)ˈsiː/'],
    ['UN', 'abbr.', '联合国', '/ˌjuːˈen/'],
    ['start', 'v.', '开始；着手', '/stɑːt/'],
    ['conversation', 'n.', '谈话；交谈', '/ˌkɒnvəˈseɪʃn/'],
    ['oh', 'interj.', '哦；啊', '/əʊ/'],
    ['bell', 'n.', '铃（声）；钟（声）', '/bel/'],
    ['Miller', '', '米勒', '/ˈmɪlə(r)/'],
  ],
  'g7a-u2': [
    ['bottle', 'n.', '瓶子', '/ˈbɒtl/'],
    ['eraser', 'n.', '橡皮', '/ɪˈreɪzə(r)/'],
    ['key', 'n.', '钥匙；关键', '/kiː/'],
    ['thing', 'n.', '东西；事情', '/θɪŋ/'],
    ['need', 'v. & n.', '需要', '/niːd/'],
    ['you\'re welcome', '', '别客气；不用谢', ''],
  ],
  'g7a-u3': [
    ['fun', 'n. & adj.', '乐趣；快乐；有趣的；使人快乐的', '/fʌn/'],
    ['yard', 'n.', '院子；园圃', '/jɑːd/'],
    ['carrot', 'n.', '胡萝卜', '/ˈkærət/'],
    ['goose', 'n.', '(pl. geese /ɡiːs/) 鹅', '/ɡuːs/'],
    ['count', 'v.', '数数', '/kaʊnt/'],
    ['another', 'adj. & pron.', '另一；又一（人或事物）', '/əˈnʌðə(r)/'],
    ['else', 'adv.', '其他的；别的', '/els/'],
    ['look at', '', '看；瞧', ''],
  ],
  'g7a-u4': [
    ['make friends', '', '交朋友', ''],
    ['get to know', '', '认识；了解', ''],
    ['each', 'adj. & pron.', '每个；各自', '/iːtʃ/'],
    ['other', 'pron. & adj.', '另外的人（或物）；另外的；其他的', '/ˈʌðə(r)/'],
    ['each other', '', '互相；彼此', ''],
    ['full', 'adj.', '完整的；满的', '/fʊl/'],
    ['full name', '', '全名', ''],
    ['grade', 'n.', '年级；等级', '/ɡreɪd/'],
    ['last name', '', '姓氏', ''],
    ['Green', '', '格林', '/ɡriːn/'],
    ['UK', '', '英国', '/ˌjuːˈkeɪ/'],
    ['US', '', '美国', '/ˌjuːˈes/'],
    ['Smith', '', '史密斯', '/smɪθ/'],
    ['classmate', 'n.', '同班同学', '/ˈklɑːsmeɪt/'],
    ['class teacher', '', '班主任', ''],
    ['first name', '', '名字', ''],
    ['mistake', 'n.', '错误；失误', '/mɪˈsteɪk/'],
    ['country', 'n.', '国家', '/ˈkʌntri/'],
    ['same', 'adj.', '相同的', '/seɪm/'],
    ['twin', 'n. & adj.', '双胞胎之一；双胞胎之一的', '/twɪn/'],
    ['both', 'adj. & pron.', '两个；两个都', '/bəʊθ/'],
    ['band', 'n.', '乐队', '/bænd/'],
    ['pot', 'n.', '锅', '/pɒt/'],
    ['a lot', '', '很；非常', ''],
    ['tofu', 'n.', '豆腐', '/ˈtəʊfuː/'],
    ['Lisa', '', '莉萨', '/ˈliːzə/'],
    ['Tom', '', '汤姆', '/tɒm/'],
    ['hot pot', '', '火锅', ''],
    ['Sally', '', '萨莉', '/ˈsæli/'],
    ['Wood', '', '伍德', '/wʊd/'],
    ['Sydney', '', '悉尼（澳大利亚城市）', '/ˈsɪdni/'],
    ['Australia', '', '澳大利亚', '/ɒˈstreɪliə/'],
    ['Mapo tofu', '', '麻婆豆腐', ''],
    ['parrot', 'n.', '鹦鹉', '/ˈpærət/'],
    ['guitar', 'n.', '吉他', '/ɡɪˈtɑː(r)/'],
    ['tennis', 'n.', '网球', '/ˈtenɪs/'],
    ['post', 'n. & v.', '帖子；邮政；邮寄；发布', '/pəʊst/'],
    ['even', 'adv.', '甚至；连；愈加', '/ˈiːvn/'],
    ['hey', 'interj.', '嘿；喂', '/heɪ/'],
    ['play the guitar', '', '弹吉他', ''],
    ['would', 'modal v.', '想（用于礼貌地邀请或向某人提供某物）；将会', '/wʊd; wəd/'],
    ['would (\'d) like to', '', '表示愿意、喜欢', ''],
    ['Beijing roast duck', '', '北京烤鸭', '/rəʊst/'],
    ['Singapore', '', '新加坡', '/ˌsɪŋəˈpɔː(r)/'],
    ['Pauline', '', '保利娜', '/ˈpɔːliːn/'],
    ['Lee', '', '李', '/liː/'],
    ['Coco', '', '科科', '/ˈkəʊkəʊ/'],
    ['London', '', '伦敦（英国首都）', '/ˈlʌndən/'],
    ['information', 'n.', '信息；消息', '/ˌɪnfəˈmeɪʃn/'],
    ['hobby', 'n.', '业余爱好', '/ˈhɒbi/'],
  ],
  'g7a-u5': [
    ['mean', 'v.', '意思是；打算', '/miːn/'],
    ['husband', 'n.', '丈夫', '/ˈhʌzbənd/'],
    ['David', '', '戴维', '/ˈdeɪvɪd/'],
    ['Jim', '', '吉姆', '/dʒɪm/'],
    ['bat', 'n.', '球棒；球拍', '/bæt/'],
    ['ping-pong bat', '', '乒乓球拍', ''],
    ['play ping-pong', '', '打乒乓球', ''],
    ['every day', '', '每天', ''],
    ['together', 'adv.', '在一起；共同', '/təˈɡeðə(r)/'],
    ['fishing rod', '', '钓竿', '/rɒd/'],
    ['spend', 'v.', '花（时间、钱等）', '/spend/'],
    ['a lot of / lots of', '', '大量；许多', ''],
    ['really', 'adv.', '非常；确实；真正地', '/ˈriːəli/'],
    ['activity', 'n.', '活动', '/ækˈtɪvəti/'],
    ['chess', 'n.', '国际象棋', '/tʃes/'],
    ['Chinese chess', '', '中国象棋', ''],
    ['funny', 'adj.', '好笑的；奇怪的', '/ˈfʌni/'],
    ['laugh', 'v. & n.', '笑；发笑；笑声', '/lɑːf/'],
    ['different', 'adj.', '不同的', '/ˈdɪfrənt/'],
    ['violin', 'n.', '小提琴', '/ˌvaɪəˈlɪn/'],
    ['have fun', '', '玩得高兴', ''],
    ['Kate', '', '凯特', '/keɪt/'],
    ['pink', 'adj. & n.', '粉红色（的）', '/pɪŋk/'],
    ['hat', 'n.', '帽子', '/hæt/'],
    ['handsome', 'adj.', '英俊的', '/ˈhænsəm/'],
    ['knee', 'n.', '膝；膝盖', '/niː/'],
    ['at night', '', '在夜晚', ''],
    ['in the middle', '', '中间；中部', ''],
    ['grandchild', 'n.', '(pl. grandchildren /ˈɡræntʃɪldrən/) （外）孙子；（外）孙女', '/ˈɡræntʃaɪld/'],
    ['Lily', '', '莉莉', '/ˈlɪli/'],
    ['Ireland', '', '爱尔兰', '/ˈaɪələnd/'],
    ['Fred', '', '弗雷德', '/fred/'],
    ['Sam', '', '萨姆', '/sæm/'],
    ['Jane', '', '简', '/dʒeɪn/'],
    ['Jack', '', '杰克', '/dʒæk/'],
    ['Sarah', '', '萨拉', '/ˈseərə/'],
    ['Oscar', '', '奥斯卡', '/ˈɒskə(r)/'],
    ['Lucy', '', '露西', '/ˈluːsi/'],
    ['son', 'n.', '儿子', '/sʌn/'],
    ['next to', '', '紧邻；在……近旁', ''],
    ['hike', 'v. & n.', '远足；徒步旅行', '/haɪk/'],
    ['go hiking', '', '远足；徒步旅行', ''],
  ],
  'g7a-u6': [
    ['hall', 'n.', '礼堂；大厅', '/hɔːl/'],
    ['dining hall', '', '餐厅', '/ˈdaɪnɪŋ/'],
    ['in front of', '', '在……前面', ''],
    ['building', 'n.', '建筑物；房子', '/ˈbɪldɪŋ/'],
    ['across', 'prep. & adv.', '过；穿过', '/əˈkrɒs/'],
    ['across from', '', '在对面', ''],
    ['field', 'n.', '场地；田地', '/fiːld/'],
    ['sports field', '', '运动场', ''],
    ['gym', 'n.', '(=gymnasium /dʒɪmˈneɪziəm/) 体育馆；健身房；（尤指学校的）体育活动', '/dʒɪm/'],
    ['office', 'n.', '办公室', '/ˈɒfɪs/'],
    ['large', 'adj.', '大的；大号的', '/lɑːdʒ/'],
    ['special', 'adj.', '特别的；特殊的', '/ˈspeʃl/'],
    ['smart', 'adj.', '智能的；聪明的', '/smɑːt/'],
    ['whiteboard', 'n.', '白板；白色书写板', '/ˈwaɪtbɔːd/'],
    ['put up', '', '张贴；搭建', ''],
    ['important', 'adj.', '重要的', '/ɪmˈpɔːtnt/'],
    ['notice', 'n. & v.', '通知；注意；注意到；意识到', '/ˈnəʊtɪs/'],
    ['locker', 'n.', '有锁存物柜；寄物柜', '/ˈlɒkə(r)/'],
    ['drawer', 'n.', '抽屉', '/drɔː(r)/'],
    ['at the back (of)', '', '在（……）后面', ''],
    ['corner', 'n.', '角；墙角；街角', '/ˈkɔːnə(r)/'],
    ['bookcase', 'n.', '书架；书柜', '/ˈbʊkkeɪs/'],
    ['screen', 'n.', '屏幕；银幕', '/skriːn/'],
    ['at school', '', '在学校', ''],
    ['modern', 'adj.', '现代的；当代的', '/ˈmɒdn/'],
    ['do exercises', '', '做体操', ''],
    ['amazing', 'adj.', '令人惊奇（惊喜或惊叹）的', '/əˈmeɪzɪŋ/'],
    ['raise', 'v.', '使升高；提高', '/reɪz/'],
    ['flag', 'n.', '旗；旗帜', '/flæɡ/'],
    ['most', 'adj. & pron. & adv.', '大多数；最多；最大；最', '/məʊst/'],
    ['change', 'v. & n.', '改变；变化', '/tʃeɪndʒ/'],
    ['seat', 'n.', '座位', '/siːt/'],
    ['delicious', 'adj.', '美味的；可口的', '/dɪˈlɪʃəs/'],
    ['How about', '', '……怎么样；如何', ''],
    ['yours', 'pron.', '（通常写作 Yours，用于书信结尾的签名前）你的；您的', '/jɔːz/'],
    ['Flora', '', '弗洛拉', '/ˈflɔːrə/'],
    ['similar', 'adj.', '类似的；相像的', '/ˈsɪmələ(r)/'],
    ['similar to', '', '类似的；相像的', ''],
    ['sound', 'v. & n.', '听起来；好像；声音；响声', '/saʊnd/'],
    ['bye for now', '', '再见', ''],
  ],
  'g7a-u7': [
    ['biology', 'n.', '生物学', '/baɪˈɒlədʒi/'],
    ['IT', 'abbr.', '(=information technology /tekˈnɒlədʒi/) 信息技术', '/ˌaɪˈtiː/'],
    ['geography', 'n.', '地理（学）', '/dʒiˈɒɡrəfi/'],
    ['history', 'n.', '历史；历史课', '/ˈhɪstri/'],
    ['boring', 'adj.', '乏味的；令人生厌的', '/ˈbɔːrɪŋ/'],
    ['useful', 'adj.', '有用的；有益的', '/ˈjuːsfl/'],
    ['exciting', 'adj.', '令人激动的；使人兴奋的', '/ɪkˈsaɪtɪŋ/'],
    ['past', 'n. & adj. & prep.', '过去；过去的事情；过去的；在……之后', '/pɑːst/'],
    ['good with', '', '灵巧的；善于应付……的', ''],
    ['number', 'n.', '数字；号码', '/ˈnʌmbə(r)/'],
    ['help sb with sth', '', '帮助某人做（某事）', ''],
    ['reason', 'n.', '原因；理由', '/ˈriːzn/'],
    ['listen to', '', '听；倾听', ''],
    ['good at', '', '擅长', ''],
    ['remember', 'v.', '记住；记起', '/rɪˈmembə(r)/'],
    ['everyone', 'pron.', '每人；所有人', '/ˈevriwʌn/'],
    ['as', 'prep. & conj.', '如同；作为；当……时；由于', '/æz; əz/'],
    ['Baker', '', '贝克', '/ˈbeɪkə(r)/'],
    ['AM (=a.m.)', '', '上午', ''],
    ['PM (=p.m.)', '', '下午；午后', ''],
    ['French', 'n. & adj.', '法语；法国的；法国人的', '/frentʃ/'],
    ['excellent', 'adj.', '优秀的；极好的', '/ˈeksələnt/'],
    ['instrument', 'n.', '器械；工具', '/ˈɪnstrəmənt/'],
    ['singer', 'n.', '歌手', '/ˈsɪŋə(r)/'],
    ['future', 'n.', '将来；未来', '/ˈfjuːtʃə(r)/'],
    ['in the future', '', '将来；未来', ''],
    ['term', 'n.', '学期', '/tɜːm/'],
    ['work out', '', '计算出；解决', ''],
    ['problem', 'n.', '难题；困难', '/ˈprɒbləm/'],
    ['in class', '', '课堂上', ''],
    ['magic', 'n. & adj.', '魔法；魔力；魔术；有魔力的；有神奇力量的', '/ˈmædʒɪk/'],
    ['life', 'n.', '生活；生命', '/laɪf/'],
    ['scientist', 'n.', '科学家', '/ˈsaɪəntɪst/'],
    ['Mike', '', '迈克', '/maɪk/'],
    ['Davis', '', '戴维斯', '/ˈdeɪvɪs/'],
    ['Canada', '', '加拿大', '/ˈkænədə/'],
  ],
  'g7a-u8': [
    ['club', 'n.', '俱乐部；社团', '/klʌb/'],
    ['join', 'v.', '参加；加入', '/dʒɔɪn/'],
    ['choose', 'v.', '选择；挑选', '/tʃuːz/'],
    ['drama', 'n.', '戏剧；戏剧表演', '/ˈdrɑːmə/'],
    ['play Chinese chess', '', '下中国象棋', ''],
    ['feeling', 'n.', '感觉；情感', '/ˈfiːlɪŋ/'],
    ['news', 'n.', '消息；新闻', '/njuːz/'],
    ['musical', 'adj.', '音乐的；有音乐天赋的', '/ˈmjuːzɪkl/'],
    ['musical instrument', '', '乐器', ''],
    ['exactly', 'adv.', '正是如此；准确地', '/ɪɡˈzæktli/'],
    ['drum', 'n.', '鼓', '/drʌm/'],
    ['ability', 'n.', '能力；才能', '/əˈbɪləti/'],
    ['paint', 'v. & n.', '用颜料画；在……上刷油漆；油漆；涂料', '/peɪnt/'],
    ['climb', 'v.', '攀登；爬', '/klaɪm/'],
    ['more', 'adj. & pron.', '更多（的）', '/mɔː(r)/'],
    ['Linda', '', '琳达', '/ˈlɪndə/'],
    ['act', 'v. & n.', '扮演；行动；（戏剧等）一幕；行动', '/ækt/'],
    ['act out', '', '表演', ''],
    ['at home', '', '在家里', ''],
    ['interested', 'adj.', '感兴趣的', '/ˈɪntrəstɪd/'],
    ['interested in', '', '对……感兴趣', ''],
    ['nature', 'n.', '自然界；大自然', '/ˈneɪtʃə(r)/'],
    ['beef', 'n.', '牛肉', '/biːf/'],
    ['soon', 'adv.', '不久；很快', '/suːn/'],
    ['than', 'prep. & conj.', '（用以引出比较的第二部分）比', '/ðæn; ðən/'],
    ['more than', '', '多于', ''],
    ['mind', 'n.', '头脑；心智', '/maɪnd/'],
    ['fall', 'v. & n.', '进入；掉落；跌倒；（美式）秋天', '/fɔːl/'],
    ['fall in love with', '', '爱上……', ''],
    ['take photos / take a photo', '', '拍照', ''],
    ['collect', 'v.', '收集；采集', '/kəˈlekt/'],
    ['insect', 'n.', '昆虫', '/ˈɪnsekt/'],
    ['discover', 'v.', '发现；发觉', '/dɪˈskʌvə(r)/'],
    ['wildlife', 'n.', '野生动物；野生生物', '/ˈwaɪldlaɪf/'],
    ['Alice', '', '爱丽丝', '/ˈælɪs/'],
    ['Bill', '', '比尔', '/bɪl/'],
    ['White', '', '怀特', '/waɪt/'],
    ['Jenny', '', '珍妮', '/ˈdʒeni/'],
  ],
  'g7a-u9': [
    ['make use of', '', '使用……；利用……', ''],
    ['shower', 'n. & v.', '淋浴；淋浴器；洗淋浴', '/ˈʃaʊə(r)/'],
    ['take a shower', '', '淋浴', ''],
    ['get dressed', '', '穿衣服', ''],
    ['brush', 'v. & n.', '（用刷子）刷；刷子；画笔', '/brʌʃ/'],
    ['tooth', 'n.', '(pl. teeth /tiːθ/) 牙齿', '/tuːθ/'],
    ['duty', 'n.', '值班；职责', '/ˈdjuːti/'],
    ['on duty', '', '值班', ''],
    ['usually', 'adv.', '通常地；一般地', '/ˈjuːʒuəli/'],
    ['get up', '', '起床；站起', ''],
    ['reporter', 'n.', '记者', '/rɪˈpɔːtə(r)/'],
    ['around', 'prep. & adv.', '大约；环绕；到处', '/əˈraʊnd/'],
    ['homework', 'n.', '家庭作业', '/ˈhəʊmwɜːk/'],
    ['go to bed', '', '上床睡觉', ''],
    ['saying', 'n.', '谚语；格言', '/ˈseɪɪŋ/'],
    ['rise', 'v. & n.', '起床；升起；增长；增加；增强', '/raɪz/'],
    ['stay', 'v.', '停留；待', '/steɪ/'],
    ['routine', 'n.', '常规', '/ruːˈtiːn/'],
    ['restaurant', 'n.', '餐馆；餐厅', '/ˈrestrɒnt/'],
    ['housework', 'n.', '家务劳动', '/ˈhaʊswɜːk/'],
    ['while', 'n. & conj.', '一段时间；一会儿；在……期间；当……的时候', '/waɪl/'],
    ['weekend', 'n.', '周末', '/ˌwiːkˈend/'],
    ['daily', 'adj.', '每日的；日常的', '/ˈdeɪli/'],
    ['daily routine', '', '日常生活', ''],
    ['only', 'adv.', '只；仅', '/ˈəʊnli/'],
    ['break', 'n. & v.', '休息；间断；（使）破碎；损坏', '/breɪk/'],
    ['Finnish', 'n. & adj.', '芬兰语；芬兰的；芬兰人的；芬兰语的', '/ˈfɪnɪʃ/'],
    ['finish', 'v.', '结束；完成', '/ˈfɪnɪʃ/'],
    ['hockey', 'n.', '曲棍球', '/ˈhɒki/'],
    ['ice hockey', '', '冰球运动；冰上曲棍球', ''],
    ['already', 'adv.', '已经；早已', '/ˌɔːlˈredi/'],
    ['dark', 'adj.', '昏暗的；深色的', '/dɑːk/'],
    ['outside', 'adv. & adj. & prep.', '在外面；外面的；在……外面', '/ˌaʊtˈsaɪd/'],
    ['prepare', 'v.', '把……预备好；准备', '/prɪˈpeə(r)/'],
    ['Timo', '', '蒂莫', '/ˈtiːməʊ/'],
    ['Halla', '', '哈拉', '/ˈhælə/'],
    ['Helsinki', '', '赫尔辛基（芬兰首都）', '/ˈhelsɪŋki/'],
    ['Finland', '', '芬兰', '/ˈfɪnlənd/'],
    ['home economics', '', '家事经济', '/ˌiːkəˈnɒmɪks/'],
  ],
  'g7a-u10': [
    ['celebrate', 'v.', '庆祝；庆贺', '/ˈselɪbreɪt/'],
    ['surprise', 'n. & v.', '惊奇；惊讶；使感到意外', '/səˈpraɪz/'],
    ['something', 'pron.', '某事；某物', '/ˈsʌmθɪŋ/'],
    ['sale', 'n.', '出售；销售', '/seɪl/'],
    ['kilo', 'n.', '千克；公斤', '/ˈkiːləʊ/'],
    ['yogurt', 'n.', '(=yoghurt) 酸奶', '/ˈjɒɡət/'],
    ['total', 'n. & adj.', '总数；合计；总的；全体的', '/ˈtəʊtl/'],
    ['price', 'n.', '价格', '/praɪs/'],
    ['balloon', 'n.', '气球', '/bəˈluːn/'],
    ['chocolate', 'n.', '巧克力', '/ˈtʃɒklət/'],
    ['pizza', 'n.', '比萨饼', '/ˈpiːtsə/'],
    ['list', 'v. & n.', '列表；列清单；名单；清单', '/lɪst/'],
    ['own', 'adj. & pron.', '自己的；本人的', '/əʊn/'],
    ['example', 'n.', '例子；范例', '/ɪɡˈzɑːmpl/'],
    ['for example', '', '例如', ''],
    ['language', 'n.', '语言', '/ˈlæŋɡwɪdʒ/'],
    ['international', 'adj.', '国际的', '/ˌɪntəˈnæʃnəl/'],
    ['mark', 'v. & n.', '做记号；纪念；打分；记号', '/mɑːk/'],
    ['date', 'n.', '日期；日子', '/deɪt/'],
    ['national', 'adj.', '国家的；民族的', '/ˈnæʃnəl/'],
    ['found', 'v.', '创建；创立', '/faʊnd/'],
    ['William Shakespeare', '', '威廉·莎士比亚', '/ˈwɪljəm ˈʃeɪkspɪə(r)/'],
    ['Florence Nightingale', '', '弗洛伦斯·南丁格尔', '/ˈflɒrəns ˈnaɪtɪŋɡeɪl/'],
    ['National Day', '', '国庆节', ''],
    ['CPC Founding Day', '', '中国共产党建党纪念日', ''],
    ['PLA Day', '', '中国人民解放军建军节', ''],
    ['meaningful', 'adj.', '重要的；重大的', '/ˈmiːnɪŋfl/'],
    ['make a wish', '', '许愿', ''],
    ['village', 'n.', '村庄；村镇', '/ˈvɪlɪdʒ/'],
    ['grow', 'v.', '成长；长大；增长', '/ɡrəʊ/'],
    ['blow', 'v.', '吹；刮', '/bləʊ/'],
    ['blow out', '', '吹灭', ''],
    ['enjoy', 'v.', '享受……的乐趣；喜欢', '/ɪnˈdʒɔɪ/'],
    ['height', 'n.', '身高；高度', '/haɪt/'],
    ['later', 'adv. & adj.', '以后（的）；后来（的）', '/ˈleɪtə(r)/'],
    ['next time', '', '下次', ''],
    ['Judy', '', '朱迪', '/ˈdʒuːdi/'],
    ['Clark', '', '克拉克', '/klɑːk/'],
    ['whom', 'pron.', '谁；什么人', '/huːm/'],
  ],
};

const RAW_WORDS_PRI = {
  'gPri-u1': [
    ['hello', 'interj.', '你好；喂', '/həˈləʊ/'],
    ['how', 'adv.', '怎样；如何', '/haʊ/'],
    ['do', 'aux v. & v.', '（第三人称单数形式 does /dʌz/）用于构成否定句和疑问句；做；干', '/duː; də/'],
    ['you', 'pron.', '你；您；你们', '/juː/'],
    ['people', 'n.', '人；人们', '/ˈpiːpl/'],
    ['hi', 'interj.', '嗨；喂', '/haɪ/'],
    ['good', 'adj.', '好的', '/ɡʊd/'],
    ['morning', 'n.', '早晨；上午', '/ˈmɔːnɪŋ/'],
    ['and', 'conj.', '和；又', '/ænd; ənd/'],
    ['Ms', 'n.', '（用于女子的姓氏或姓名前，不指明婚否）女士', '/mɪz; məz/'],
    ['class', 'n.', '班级；课', '/klɑːs/'],
    ['my', 'pron.', '我的', '/maɪ/'],
    ['name', 'n.', '名字；名称', '/neɪm/'],
    ['is', 'v.', '是', '/ɪz/'],
    ['over', 'adv. & prep.', '在或到某处；在……上面', '/ˈəʊvə/'],
    ['goodbye', 'interj. & n.', '再见；再会', '/ˌɡʊdˈbaɪ/'],
    ['what', 'pron. & adj.', '什么', '/wɒt/'],
    ['your', 'pron.', '你的；您的', '/jɔː(r); jə(r)/'],
    ['where', 'adv.', '在哪里；到哪里', '/weə(r)/'],
    ['here', 'adv.', '在这里', '/hɪə(r)/'],
    ['a / an', 'art.', '（用于单数可数名词前，表示未曾提到的）一（人、事、物）', '/ə; eɪ/ (/æn; ən/)'],
    ['are', 'v.', '是', '/ɑː(r); ə(r)/'],
    ['nice', 'adj.', '令人愉快的；宜人的', '/naɪs/'],
    ['to', 'prep.', '常用于原形动词之前，表示该动词为不定式；至', '/tuː; tə/'],
    ['meet', 'v.', '遇见；相逢', '/miːt/'],
    ['may', 'modal v.', '可以；可能', '/meɪ/'],
    ['I', 'pron.', '我', '/aɪ/'],
    ['have', 'v.', '（第三人称单数形式 has /hæz; həz/）有', '/hæv; həv/'],
    ['can', 'modal v.', '能；会', '/kæn; kən/'],
    ['call', 'v.', '把……叫做；（给……）打电话；呼唤', '/kɔːl/'],
    ['me', 'pron.', '（I 的宾格）我', '/miː/'],
    ['too', 'adv.', '也；又；太', '/tuː/'],
    ['am', 'v.', '是', '/æm; əm/'],
    ['fine', 'adj.', '健康的；美好的', '/faɪn/'],
    ['thank', 'v.', '感谢；谢谢', '/θæŋk/'],
    ['great', 'adj.', '美妙的；伟大的', '/ɡreɪt/'],
    ['that', 'pron.', '那；那个', '/ðæt/'],
    ['the', 'art.', '指已提到或易领会到的人或事物', '/ðiː; ðə/'],
    ['let', 'v.', '允许；让', '/let/'],
    ['us', 'pron.', '（we 的宾格）我们', '/ʌs; əs/'],
    ['go', 'v.', '去；走', '/ɡəʊ/'],
    ['bye', 'interj.', '(=goodbye) 再见', '/baɪ/'],
    ['it', 'pron.', '它', '/ɪt/'],
    ['time', 'n.', '时间', '/taɪm/'],
    ['for', 'prep.', '为了；给；对', '/fə(r); fɔː(r)/'],
  ],
  'gPri-u2': [
    ['keep', 'v.', '（使）保持；保留', '/kiːp/'],
    ['tidy', 'adj.', '整洁的；井井有条的', '/ˈtaɪdi/'],
    ['in', 'prep.', '在……里；表示某事完成或发生的方式', '/ɪn/'],
    ['schoolbag', 'n.', '书包', '/ˈskuːlbæɡ/'],
    ['cap', 'n.', '（无帽边或有帽舌的）帽子；棒球帽', '/kæp/'],
    ['ruler', 'n.', '尺；直尺', '/ˈruːlə(r)/'],
    ['pencil', 'n.', '铅笔', '/ˈpensl/'],
    ['red', 'adj. & n.', '红色（的）', '/red/'],
    ['green', 'adj. & n.', '绿色（的）', '/ɡriːn/'],
    ['blue', 'adj. & n.', '蓝色（的）', '/bluː/'],
    ['yellow', 'adj. & n.', '黄色（的）', '/ˈjeləʊ/'],
    ['orange', 'adj. & n.', '橙红色（的）；橘黄色（的）；橙子；柑橘', '/ˈɒrɪndʒ/'],
    ['black', 'adj. & n.', '黑色（的）', '/blæk/'],
    ['white', 'adj. & n.', '白色（的）', '/waɪt/'],
    ['brown', 'adj. & n.', '棕色（的）；褐色（的）', '/braʊn/'],
    ['colour', 'n.', '(=color) 颜色', '/ˈkʌlə(r)/'],
    ['they', 'pron.', '他（她、它）们', '/ðeɪ/'],
    ['bicycle', 'n.', '(=bike) 自行车；脚踏车', '/ˈbaɪsɪkl/'],
    ['trousers', 'n.', '(pl.) 裤子', '/ˈtraʊzəz/'],
    ['put', 'v.', '放', '/pʊt/'],
    ['bed', 'n.', '床', '/bed/'],
    ['desk', 'n.', '书桌', '/desk/'],
    ['chair', 'n.', '椅子', '/tʃeə(r)/'],
    ['cat', 'n.', '猫', '/kæt/'],
    ['shoe', 'n.', '鞋', '/ʃuː/'],
    ['box', 'n.', '箱；盒；方框', '/bɒks/'],
    ['pair', 'n.', '一双；一对', '/peə(r)/'],
    ['of', 'prep.', '属于（某人）；关于（某人）', '/ɒv; əv/'],
    ['on', 'prep.', '在……上', '/ɒn/'],
    ['under', 'prep.', '在……下', '/ˈʌndə(r)/'],
    ['mum', 'n.', '(=mom) 妈妈', '/mʌm/'],
    ['find', 'v.', '找到；发现', '/faɪnd/'],
    ['not', 'adv.', '不；没有', '/nɒt/'],
    ['new', 'adj.', '新的；刚出现的', '/njuː/'],
    ['no', 'interj. & adv.', '不；不要；没有；不是', '/nəʊ/'],
    ['room', 'n.', '房间', '/ruːm/'],
    ['OK', 'adj. & adv.', '可以（的）', '/ˌəʊˈkeɪ/'],
    ['sorry', 'adj.', '抱歉的；惋惜的', '/ˈsɒri/'],
    ['dad', 'n.', '爸爸', '/dæd/'],
    ['glasses', 'n.', '(pl.) 眼镜', '/ˈɡlɑːsɪz/'],
    ['see', 'v.', '看见', '/siː/'],
    ['them', 'pron.', '（they 的宾格）他（她、它）们', '/ðem; ðəm/'],
    ['wait', 'v.', '等待；等候', '/weɪt/'],
    ['minute', 'n.', '分；分钟', '/ˈmɪnɪt/'],
    ['now', 'adv.', '现在；目前', '/naʊ/'],
    ['head', 'n.', '头', '/hed/'],
    ['welcome', 'adj. & n. & interj.', '受欢迎的；欢迎', '/ˈwelkəm/'],
    ['her', 'pron.', '她的', '/hɜː(r); hə(r)/'],
    ['nose', 'n.', '鼻子', '/nəʊz/'],
  ],
  'gPri-u3': [
    ['these', 'pron.', '这些', '/ðiːz/'],
    ['plant', 'n. & v.', '植物；种植', '/plɑːnt/'],
    ['baby', 'n.', '动物幼崽；婴儿', '/ˈbeɪbi/'],
    ['chicken', 'n.', '鸡；鸡肉', '/ˈtʃɪkɪn/'],
    ['dog', 'n.', '狗', '/dɒɡ/'],
    ['rabbit', 'n.', '兔子', '/ˈræbɪt/'],
    ['tomato', 'n.', '西红柿', '/təˈmɑːtəʊ/'],
    ['flower', 'n.', '花', '/ˈflaʊə(r)/'],
    ['apple', 'n.', '苹果', '/ˈæpl/'],
    ['tree', 'n.', '树', '/triː/'],
    ['this', 'pron.', '这；这个', '/ðɪs/'],
    ['those', 'pron.', '那些', '/ðəʊz/'],
    ['animal', 'n.', '动物', '/ˈænɪml/'],
    ['duck', 'n.', '鸭子', '/dʌk/'],
    ['potato', 'n.', '土豆', '/pəˈteɪtəʊ/'],
    ['many', 'adj. & pron.', '许多', '/ˈmeni/'],
    ['grandparent', 'n.', '祖父（母）；外祖父（母）', '/ˈɡrænpeərənt/'],
    ['farm', 'n.', '农场', '/fɑːm/'],
    ['cow', 'n.', '奶牛', '/kaʊ/'],
    ['small', 'adj.', '小的', '/smɔːl/'],
    ['lake', 'n.', '湖', '/leɪk/'],
    ['house', 'n.', '房子', '/haʊs/'],
    ['horse', 'n.', '马', '/hɔːs/'],
    ['sheep', 'n.', '(pl. sheep) 羊；绵羊', '/ʃiːp/'],
    ['big', 'adj.', '大的', '/bɪɡ/'],
    ['look', 'v.', '看', '/lʊk/'],
    ['uncle', 'n.', '舅父；叔父；伯父；姑父；姨父', '/ˈʌŋkl/'],
    ['kind', 'n. & adj.', '种类；体贴的；亲切的', '/kaɪnd/'],
    ['he', 'pron.', '他', '/hiː; hi/'],
    ['pig', 'n.', '猪', '/pɪɡ/'],
    ['there', 'adv.', '在那里', '/ðeə(r)/'],
    ['behind', 'prep.', '在……的后面', '/bɪˈhaɪnd/'],
    ['home', 'n.', '家', '/həʊm/'],
    ['beautiful', 'adj.', '美丽的', '/ˈbjuːtɪfl/'],
    ['like', 'v.', '喜欢', '/laɪk/'],
    ['his', 'pron.', '他的', '/hɪz/'],
    ['at', 'prep.', '向；朝；在（某处、某时间或时刻）', '/æt; ət/'],
  ],
  'gPri-u4': [
    ['we', 'pron.', '我们', '/wiː; wi/'],
    ['make', 'v.', '使成为；制造', '/meɪk/'],
    ['friend', 'n.', '朋友', '/frend/'],
    ['get', 'v.', '去取（或带来）；得到', '/ɡet/'],
    ['know', 'v.', '知道', '/nəʊ/'],
    ['old', 'adj.', '老的；旧的', '/əʊld/'],
    ['from', 'prep.', '从……来；从……开始', '/frɒm; frəm/'],
    ['last', 'adj.', '最后的；末尾的', '/lɑːst/'],
    ['year', 'n.', '年', '/jɪə(r); jɜː(r)/'],
    ['yes', 'interj.', '是的；可以', '/jes/'],
    ['Mr', 'n.', '（用于男子的姓氏或姓名前）先生', '/ˈmɪstə(r)/'],
    ['our', 'pron.', '我们的', '/ˈaʊə(r)/'],
    ['English', 'n. & adj.', '英语；英格兰；英语的；英格兰的', '/ˈɪŋɡlɪʃ/'],
    ['teacher', 'n.', '教师', '/ˈtiːtʃə(r)/'],
    ['which', 'pron.', '哪一个；哪一些', '/wɪtʃ/'],
    ['who', 'pron.', '谁；什么人', '/huː/'],
    ['job', 'n.', '工作', '/dʒɒb/'],
    ['she', 'pron.', '她', '/ʃiː; ʃi/'],
    ['favourite', 'adj.', '(=favorite) 最喜欢的；最爱的', '/ˈfeɪvərɪt/'],
    ['pet', 'n.', '宠物', '/pet/'],
    ['very', 'adv.', '很；非常', '/ˈveri/'],
    ['much', 'pron. & adj.', '许多；大量；多少', '/mʌtʃ/'],
    ['cute', 'adj.', '可爱的', '/kjuːt/'],
    ['school', 'n.', '学校', '/skuːl/'],
    ['China', 'n.', '中国', '/ˈtʃaɪnə/'],
    ['panda', 'n.', '熊猫', '/ˈpændə/'],
  ],
  'gPri-u5': [
    ['or', 'conj.', '或者；也不（用于否定句）', '/ɔː(r)/'],
    ['mother', 'n.', '母亲', '/ˈmʌðə(r)/'],
    ['cousin', 'n.', '堂兄（弟、姊、妹）；表兄（弟、姊、妹）', '/ˈkʌzn/'],
    ['child', 'n.', '(pl. children /ˈtʃɪldrən/) 儿童；小孩', '/tʃaɪld/'],
    ['aunt', 'n.', '姑（姨、伯、婶、舅）母', '/ɑːnt/'],
    ['sister', 'n.', '姐；妹', '/ˈsɪstə(r)/'],
    ['grandmother', 'n.', '奶奶；外婆', '/ˈɡrænmʌðə(r)/'],
    ['brother', 'n.', '兄；弟', '/ˈbrʌðə(r)/'],
    ['grandfather', 'n.', '爷爷；外公', '/ˈɡrænfɑːðə(r)/'],
    ['come', 'v.', '来；来到', '/kʌm/'],
    ['ping-pong', 'n.', '乒乓球运动', '/ˈpɪŋpɒŋ/'],
    ['whose', 'pron.', '谁的', '/huːz/'],
    ['well', 'interj. & adv. & adj.', '嗯；好吧；好；令人满意地；健康的', '/wel/'],
    ['grandpa', 'n.', '爷爷；外公', '/ˈɡrænpɑː/'],
    ['every', 'adj.', '每一；每个', '/ˈevri/'],
    ['day', 'n.', '一天；白天', '/deɪ/'],
    ['week', 'n.', '周', '/wiːk/'],
    ['fish', 'v. & n.', '钓鱼；鱼；鱼肉', '/fɪʃ/'],
    ['father', 'n.', '父亲；爸爸', '/ˈfɑːðə(r)/'],
    ['piano', 'n.', '钢琴', '/piˈænəʊ/'],
    ['book', 'n.', '书', '/bʊk/'],
    ['basketball', 'n.', '篮球', '/ˈbɑːskɪtbɔːl/'],
    ['read', 'v.', '读；阅读', '/riːd/'],
    ['classroom', 'n.', '教室', '/ˈklɑːsruːm/'],
    ['their', 'pron.', '他（她、它）们的', '/ðeə(r)/'],
    ['clean', 'adj. & v.', '干净的；使……干净；打扫', '/kliːn/'],
    ['wear', 'v.', '穿；戴', '/weə(r)/'],
    ['talk', 'v. & n.', '说话；交谈', '/tɔːk/'],
    ['tall', 'adj.', '高的', '/tɔːl/'],
    ['short', 'adj.', '短的；矮的', '/ʃɔːt/'],
  ],
  'gPri-u6': [
    ['front', 'n.', '前面', '/frʌnt/'],
    ['between', 'prep.', '在……之间', '/bɪˈtwiːn/'],
    ['library', 'n.', '图书馆', '/ˈlaɪbrəri/'],
    ['computer', 'n.', '电脑', '/kəmˈpjuːtə(r)/'],
    ['art', 'n.', '艺术；美术', '/ɑːt/'],
    ['hair', 'n.', '头发', '/heə(r)/'],
    ['long', 'adj.', '长的', '/lɒŋ/'],
    ['quiet', 'adj.', '安静的', '/ˈkwaɪət/'],
    ['girl', 'n.', '女孩', '/ɡɜːl/'],
    ['but', 'conj.', '但是', '/bʌt; bət/'],
    ['all', 'adj. & pron.', '所有（的）；全部（的）', '/ɔːl/'],
    ['any', 'adj. & pron.', '任何（的）；任一（的）', '/ˈeni/'],
    ['photo', 'n.', '照片', '/ˈfəʊtəʊ/'],
    ['left', 'n. & adv.', '左边；向左边', '/left/'],
    ['little', 'adj.', '小的；年幼的', '/ˈlɪtl/'],
    ['right', 'n. & adv. & adj.', '右边；向右边；正确的；适当的', '/raɪt/'],
    ['always', 'adv.', '总是', '/ˈɔːlweɪz/'],
    ['story', 'n.', '故事', '/ˈstɔːri/'],
    ['night', 'n.', '夜晚', '/naɪt/'],
    ['middle', 'n. & adj.', '中间；中间的', '/ˈmɪdl/'],
    ['say', 'v.', '说', '/seɪ/'],
    ['think', 'v.', '思考', '/θɪŋk/'],
    ['football', 'n.', '足球', '/ˈfʊtbɔːl/'],
    ['eye', 'n.', '眼睛', '/aɪ/'],
    ['clever', 'adj.', '聪明的', '/ˈklevə(r)/'],
    ['next', 'adj. & pron.', '下一个（的）', '/nekst/'],
    ['him', 'pron.', '（he 的宾格）他', '/hɪm; ɪm/'],
    ['happy', 'adj.', '快乐的', '/ˈhæpi/'],
    ['help', 'v. & n.', '帮助', '/help/'],
    ['shop', 'n.', '商店', '/ʃɒp/'],
    ['science', 'n.', '科学', '/ˈsaɪəns/'],
    ['Mrs', 'n.', '（对已婚妇女的礼貌称呼）夫人；太太', '/ˈmɪsɪz/'],
    ['student', 'n.', '学生', '/ˈstjuːdnt/'],
    ['blackboard', 'n.', '黑板', '/ˈblækbɔːd/'],
    ['sit', 'v.', '坐', '/sɪt/'],
    ['up', 'adv.', '向上', '/ʌp/'],
    ['back', 'n. & adv.', '后面；背部；回来；回原处', '/bæk/'],
    ['clock', 'n.', '时钟；钟', '/klɒk/'],
    ['map', 'n.', '地图', '/mæp/'],
    ['window', 'n.', '窗户', '/ˈwɪndəʊ/'],
    ['picture', 'n.', '照片；图画', '/ˈpɪktʃə(r)/'],
    ['famous', 'adj.', '著名的', '/ˈfeɪməs/'],
    ['wall', 'n.', '墙', '/wɔːl/'],
    ['table', 'n.', '桌子', '/ˈteɪbl/'],
    ['today', 'adv. & n.', '在今天；今天', '/təˈdeɪ/'],
    ['email', 'n.', '电子邮件', '/ˈiːmeɪl/'],
    ['answer', 'n.', '答案', '/ˈɑːnsə(r)/'],
    ['question', 'n.', '问题', '/ˈkwestʃən/'],
    ['exercise', 'v. & n.', '运动；锻炼；练习', '/ˈeksəsaɪz/'],
    ['way', 'n.', '方式；道路', '/weɪ/'],
    ['best', 'adj. & adv.', '最好的；最', '/best/'],
    ['place', 'n.', '地方；地点', '/pleɪs/'],
    ['because', 'conj.', '因为', '/bɪˈkɒz/'],
    ['why', 'adv.', '为什么', '/waɪ/'],
    ['dear', 'adj.', '亲爱的', '/dɪə(r)/'],
    ['tell', 'v.', '告诉', '/tel/'],
    ['interesting', 'adj.', '有趣的', '/ˈɪntrəstɪŋ/'],
  ],
  'gPri-u7': [
    ['subject', 'n.', '学科；科目', '/ˈsʌbdʒɪkt/'],
    ['learn', 'v.', '学习；得知', '/lɜːn/'],
    ['maths', 'n.', '(=mathematics, math) 数学', '/mæθs/'],
    ['PE', 'n.', '(=physical education) 体育', '/ˌpiː ˈiː/'],
    ['hard', 'adj. & adv.', '困难的；努力地', '/hɑːd/'],
    ['sure', 'adv.', '当然；一定', '/ʃʊə(r)/'],
    ['difficult', 'adj.', '困难的', '/ˈdɪfɪkəlt/'],
    ['easy', 'adj.', '容易的', '/ˈiːzi/'],
    ['use', 'v. & n.', '使用；利用；使用；用途', '/juːz/'],
    ['give', 'v.', '给；送给；供给', '/ɡɪv/'],
    ['idea', 'n.', '想法；主意', '/aɪˈdɪə/'],
    ['listen', 'v.', '听', '/ˈlɪsn/'],
    ['draw', 'v.', '画画', '/drɔː/'],
    ['travel', 'v. & n.', '旅行；游历', '/ˈtrævl/'],
    ['walk', 'v. & n.', '行走；步行', '/wɔːk/'],
    ['afternoon', 'n.', '下午', '/ˌɑːftəˈnuːn/'],
    ['then', 'adv.', '那时；然后；那么', '/ðen/'],
    ['Miss', 'n.', '（对未婚女子的礼貌称呼）小姐；女士', '/mɪs/'],
    ['work', 'v. & n.', '工作', '/wɜːk/'],
    ['sometimes', 'adv.', '有时', '/ˈsʌmtaɪmz/'],
    ['feel', 'v.', '感觉；觉得', '/fiːl/'],
    ['busy', 'adj.', '忙碌的；无暇的', '/ˈbɪzi/'],
    ['study', 'v.', '学习', '/ˈstʌdi/'],
    ['song', 'n.', '歌曲', '/sɒŋ/'],
    ['out', 'adv. & prep.', '（从……里）出来；出去', '/aʊt/'],
  ],
  'gPri-u8': [
    ['sing', 'v.', '唱歌', '/sɪŋ/'],
    ['swim', 'v.', '游泳', '/swɪm/'],
    ['run', 'v.', '跑；跑步', '/rʌn/'],
    ['fast', 'adv. & adj.', '快地（的）', '/fɑːst/'],
    ['dance', 'n. & v.', '跳舞', '/dɑːns/'],
    ['fly', 'v.', '飞', '/flaɪ/'],
    ['so', 'adv. & conj.', '这么；那么；用来引出评论或问题；所以', '/səʊ/'],
    ['watch', 'v. & n.', '注视；观看；表；手表', '/wɒtʃ/'],
    ['cake', 'n.', '蛋糕', '/keɪk/'],
    ['cook', 'v.', '做饭', '/kʊk/'],
    ['noodle', 'n.', '(usually pl.) 面条', '/ˈnuːdl/'],
    ['open', 'v. & adj.', '打开；开放的；敞开的', '/ˈəʊpən/'],
    ['take', 'v.', '拍照；拿；取；买下', '/teɪk/'],
    ['visit', 'v. & n.', '参观；拜访', '/ˈvɪzɪt/'],
    ['park', 'n.', '公园', '/pɑːk/'],
    ['when', 'adv.', '什么时候', '/wen/'],
    ['share', 'v.', '分享；合用；分担', '/ʃeə(r)/'],
  ],
  'gPri-u9': [
    ['o\'clock', 'adv.', '（表示整点）……点钟', '/əˈklɒk/'],
    ['dress', 'v. & n.', '穿衣服；连衣裙', '/dres/'],
    ['breakfast', 'n.', '早餐', '/ˈbrekfəst/'],
    ['before', 'prep. & conj. & adv.', '在……以前；以前', '/bɪˈfɔː(r)/'],
    ['begin', 'v.', '开始', '/bɪˈɡɪn/'],
    ['dinner', 'n.', '正餐；主餐', '/ˈdɪnə(r)/'],
    ['early', 'adj. & adv.', '早的；早期的；提前；在早期', '/ˈɜːli/'],
    ['ask', 'v.', '询问；请求', '/ɑːsk/'],
    ['lunch', 'n.', '午餐', '/lʌntʃ/'],
    ['film', 'n.', '电影', '/fɪlm/'],
  ],
  'gPri-u10': [
    ['birthday', 'n.', '生日', '/ˈbɜːθdeɪ/'],
    ['month', 'n.', '月份', '/mʌnθ/'],
    ['gift', 'n.', '礼物', '/ɡɪft/'],
    ['party', 'n.', '聚会', '/ˈpɑːti/'],
    ['buy', 'v.', '买', '/baɪ/'],
    ['woman', 'n.', '(pl. women /ˈwɪmɪn/) 女人', '/ˈwʊmən/'],
    ['candle', 'n.', '蜡烛', '/ˈkændl/'],
    ['lesson', 'n.', '课；一节课', '/ˈlesn/'],
    ['ice', 'n.', '冰；冰块', '/aɪs/'],
    ['will', 'modal v.', '将要；会', '/wɪl/'],
    ['egg', 'n.', '蛋', '/eɡ/'],
    ['juice', 'n.', '果汁', '/dʒuːs/'],
    ['milk', 'n.', '牛奶', '/mɪlk/'],
    ['banana', 'n.', '香蕉', '/bəˈnɑːnə/'],
    ['drink', 'n. & v.', '饮品；喝', '/drɪŋk/'],
    ['eat', 'v.', '吃', '/iːt/'],
    ['nurse', 'n.', '护士', '/nɜːs/'],
    ['wish', 'n. & v.', '愿望；希望；祝愿', '/wɪʃ/'],
    ['hear', 'v.', '听到', '/hɪə(r)/'],
    ['door', 'n.', '门', '/dɔː(r)/'],
    ['world', 'n.', '世界', '/wɜːld/'],
  ],
  'gPri-u11': [
    ['one', 'num.', '一', '/wʌn/'],
    ['two', 'num.', '二', '/tuː/'],
    ['three', 'num.', '三', '/θriː/'],
    ['four', 'num.', '四', '/fɔː(r)/'],
    ['five', 'num.', '五', '/faɪv/'],
    ['six', 'num.', '六', '/sɪks/'],
    ['seven', 'num.', '七', '/ˈsevn/'],
    ['eight', 'num.', '八', '/eɪt/'],
    ['nine', 'num.', '九', '/naɪn/'],
    ['ten', 'num.', '十', '/ten/'],
    ['eleven', 'num.', '十一', '/ɪˈlevn/'],
    ['twelve', 'num.', '十二', '/twelv/'],
    ['thirteen', 'num.', '十三', '/ˌθɜːˈtiːn/'],
    ['fourteen', 'num.', '十四', '/ˌfɔːˈtiːn/'],
    ['fifteen', 'num.', '十五', '/ˌfɪfˈtiːn/'],
    ['sixteen', 'num.', '十六', '/ˌsɪkˈstiːn/'],
    ['seventeen', 'num.', '十七', '/ˌsevnˈtiːn/'],
    ['eighteen', 'num.', '十八', '/ˌeɪˈtiːn/'],
    ['nineteen', 'num.', '十九', '/ˌnaɪnˈtiːn/'],
    ['twenty', 'num.', '二十', '/ˈtwenti/'],
    ['thirty', 'num.', '三十', '/ˈθɜːti/'],
    ['forty', 'num.', '四十', '/ˈfɔːti/'],
    ['fifty', 'num.', '五十', '/ˈfɪfti/'],
    ['sixty', 'num.', '六十', '/ˈsɪksti/'],
    ['seventy', 'num.', '七十', '/ˈsevnti/'],
    ['eighty', 'num.', '八十', '/ˈeɪti/'],
    ['ninety', 'num.', '九十', '/ˈnaɪnti/'],
    ['hundred', 'num.', '百', '/ˈhʌndrəd/'],
    ['thousand', 'num.', '千', '/ˈθaʊznd/'],
    ['million', 'num.', '百万', '/ˈmɪljən/'],
  ],
  'gPri-u12': [
    ['first', 'num.', '第一', '/fɜːst/'],
    ['second', 'num.', '第二', '/ˈsekənd/'],
    ['third', 'num.', '第三', '/θɜːd/'],
    ['fourth', 'num.', '第四', '/fɔːθ/'],
    ['fifth', 'num.', '第五', '/fɪfθ/'],
    ['sixth', 'num.', '第六', '/sɪksθ/'],
    ['seventh', 'num.', '第七', '/ˈsevnθ/'],
    ['eighth', 'num.', '第八', '/eɪtθ/'],
    ['ninth', 'num.', '第九', '/naɪnθ/'],
    ['tenth', 'num.', '第十', '/tenθ/'],
    ['eleventh', 'num.', '第十一', '/ɪˈlevnθ/'],
    ['twelfth', 'num.', '第十二', '/twelfθ/'],
    ['thirteenth', 'num.', '第十三', '/ˌθɜːˈtiːnθ/'],
    ['fourteenth', 'num.', '第十四', '/ˌfɔːˈtiːnθ/'],
    ['fifteenth', 'num.', '第十五', '/ˌfɪfˈtiːnθ/'],
    ['sixteenth', 'num.', '第十六', '/ˌsɪkˈstiːnθ/'],
    ['seventeenth', 'num.', '第十七', '/ˌsevnˈtiːnθ/'],
    ['eighteenth', 'num.', '第十八', '/ˌeɪˈtiːnθ/'],
    ['nineteenth', 'num.', '第十九', '/ˌnaɪnˈtiːnθ/'],
    ['twentieth', 'num.', '第二十', '/ˈtwentiəθ/'],
    ['thirtieth', 'num.', '第三十', '/ˈθɜːtiəθ/'],
    ['fortieth', 'num.', '第四十', '/ˈfɔːtiəθ/'],
    ['fiftieth', 'num.', '第五十', '/ˈfɪftiəθ/'],
    ['sixtieth', 'num.', '第六十', '/ˈsɪkstiəθ/'],
    ['seventieth', 'num.', '第七十', '/ˈsevntiəθ/'],
    ['eightieth', 'num.', '第八十', '/ˈeɪtiəθ/'],
    ['ninetieth', 'num.', '第九十', '/ˈnaɪntiəθ/'],
    ['hundredth', 'num.', '第一百', '/ˈhʌndrədθ/'],
    ['thousandth', 'num.', '第一千', '/ˈθaʊzndθ/'],
    ['millionth', 'num.', '第一百万', '/ˈmɪljənθ/'],
  ],
  'gPri-u13': [
    ['January', 'n.', '一月', '/ˈdʒænjuəri/'],
    ['February', 'n.', '二月', '/ˈfebruəri/'],
    ['March', 'n.', '三月', '/mɑːtʃ/'],
    ['April', 'n.', '四月', '/ˈeɪprəl/'],
    ['May', 'n.', '五月', '/meɪ/'],
    ['June', 'n.', '六月', '/dʒuːn/'],
    ['July', 'n.', '七月', '/dʒuˈlaɪ/'],
    ['August', 'n.', '八月', '/ˈɔːɡəst/'],
    ['September', 'n.', '九月', '/sepˈtembə(r)/'],
    ['October', 'n.', '十月', '/ɒkˈtəʊbə(r)/'],
    ['November', 'n.', '十一月', '/nəʊˈvembə(r)/'],
    ['December', 'n.', '十二月', '/dɪˈsembə(r)/'],
  ],
  'gPri-u14': [
    ['Monday', 'n.', '星期一', '/ˈmʌndeɪ/'],
    ['Tuesday', 'n.', '星期二', '/ˈtjuːzdeɪ/'],
    ['Wednesday', 'n.', '星期三', '/ˈwenzdeɪ/'],
    ['Thursday', 'n.', '星期四', '/ˈθɜːzdeɪ/'],
    ['Friday', 'n.', '星期五', '/ˈfraɪdeɪ/'],
    ['Saturday', 'n.', '星期六', '/ˈsætədeɪ/'],
    ['Sunday', 'n.', '星期天', '/ˈsʌndeɪ/'],
  ],
};

/* 由 gen-wordlib-from-json.js 生成，勿手改 */
const GRADE_G7B_UNIT_TITLES = ["Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7","Unit 8"];

const RAW_WORDS_G7B = {
  'g7b-u1': [
    ["fox", "n.", "狐狸", "/fɒks/"],
    ["giraffe", "n.", "长颈鹿", "/dʒəˈrɑ:f/"],
    ["eagle", "n.", "雕；鹰", "/ˈi:ɡl/"],
    ["wolf", "n.", "(pl. wolves /wʊlvz/)  狼", "/wʊlf/"],
    ["penguin", "n.", "企鹅", "/ˈpeŋɡwɪn/"],
    ["care", "n.", "照顾；护理", "/keə(r)/"],
    ["care", "v.", "关心；在乎", "/keə(r)/"],
    ["take care of", "—", "照顾；处理", "/teɪk//keər//əv/"],
    ["sandwich", "n.", "三明治", "/ˈsænwɪtʃ; ˈsænwɪdʒ/"],
    ["snake", "n.", "蛇", "/sneɪk/"],
    ["scary", "adj.", "吓人的；恐怖的", "/ˈskeəri/"],
    ["neck", "n.", "脖子", "/nek/"],
    ["guess", "v.", "猜测；估计", "/ɡes/"],
    ["shark", "n.", "鲨鱼", "/ʃɑ:k/"],
    ["whale", "n.", "鲸", "/weɪl/"],
    ["huge", "adj.", "巨大的；极多的", "/hju:dʒ/"],
    ["dangerous", "adj.", "危险的；有危害的", "/ˈdeɪndʒərəs/"],
    ["save", "v.", "救；储蓄；保存", "/seɪv/"],
    ["luck", "n.", "幸运；运气", "/lʌk/"],
    ["Thai", "adj.", "泰国的；泰国人的", "/taɪ/"],
    ["Thai", "n.", "泰国人；泰语", "/taɪ/"],
    ["trunk", "n.", "象鼻", "/trʌŋk/"],
    ["pick", "v.", "捡；摘", "/pɪk/"],
    ["pick up", "—", "拿起；举起；接载", "/pɪk/ /ʌp/"],
    ["carry", "v.", "拿；提", "/ˈkæri/"],
    ["playful", "adj.", "爱嬉戏的；爱玩的", "/ˈpleɪfl/"],
    ["swimmer", "n.", "游泳者", "/ˈswɪmə(r)/"],
    ["one another", "—", "互相", "/,wʌn ə'nʌð.ər/"],
    ["look after", "—", "照顾", "/lʊk/ /'ɑ:f.tər/"],
    ["culture", "n.", "文化；文明", "/ˈkʌltʃə(r)/"],
    ["however", "adv.", "然而；不过", "/haʊˈevə(r)/"],
    ["danger", "n.", "危险", "/ˈdeɪndʒə(r)/"],
    ["in danger", "—", "处于危险之中", "/ɪn/ /'deɪn. dʒər/"],
    ["forest", "n.", "森林", "/ˈfɒrɪst/"],
    ["cut down", "—", "砍伐；减少", "/kʌt/ /daʊn/"],
    ["too many", "—", "太多", "/ tu://' men. i/"],
    ["kill", "v.", "杀死；弄死", "/kɪl/"],
    ["ivory", "n.", "象牙", "/ˈaɪvəri/"],
    ["made of", "—", "由 …… 制成的", "/meɪd/ /əv/"],
    ["friendly", "adj.", "友好的", "/ˈfrendli/"],
    ["quite", "adv.", "相当；完全", "/kwaɪt/"],
    ["quite a", "—", "相当；非常", "/kwaɪt/ /ə/"],
    ["not ... at all", "—", "一点也不；完全不", "/nɒt/ /æt/ /ɔ:l/"],
    ["fur", "n.", "（动物浓厚的）软毛", "/fɜ:(r)/"],
    ["blind", "adj.", "瞎的；失明的", "/blaɪnd/"],
    ["hearing", "n.", "听力；听觉", "/ˈhɪərɪŋ/"],
    ["Antarctica", "—", "南极洲", "/ænˈtɑ:ktɪkə/"],
    ["Africa", "—", "非洲", "/ˈæfrɪkə/"],
    ["Malee", "—", "玛莉", "/mɑ:ˈli:/"],
    ["Thailand", "—", "泰国", "/ˈtaɪlænd/"],
  ],
  'g7b-u2': [
    ["rule", "n.", "规则；规章", "/ru:l/"],
    ["order", "n.", "秩序；命令", "/ˈɔ:də(r)/"],
    ["order", "v.", "点菜；命令", "/ˈɔ:də(r)/"],
    ["follow", "v.", "遵循；跟随", "/ˈfɒləʊ/"],
    ["late for", "—", "迟到", "/leɪt/ /fɔ:r/"],
    ["arrive", "v.", "到达", "/əˈraɪv/"],
    ["on time", "—", "准时", "/ɒn/ /taɪm/"],
    ["hallway", "n.", "走廊", "/ˈhɔ:lweɪ/"],
    ["uniform", "n.", "校服；制服", "/ˈju:nɪfɔ:m/"],
    ["litter", "v.", "乱扔", "/ˈlɪtə(r)/"],
    ["litter", "n.", "垃圾", "/ˈlɪtə(r)/"],
    ["polite", "adj.", "有礼貌的", "/pəˈlaɪt/"],
    ["treat", "v.", "对待；招待；治疗", "/tri:t/"],
    ["treat", "n.", "款待", "/tri:t/"],
    ["respect", "n. & v.", "尊敬", "/rɪˈspekt/"],
    ["if", "conj.", "如果", "/ɪf/"],
    ["jacket", "n.", "夹克衫；短上衣", "/ˈdʒækɪt/"],
    ["have to", "—", "不得不", "/hæv// tu:/"],
    ["everything", "pron.", "每件事；一切", "/ˈevriθɪŋ/"],
    ["lend", "v.", "借给；借出", "/lend/"],
    ["sweet", "n.", "糖果", "/swi:t/"],
    ["sweet", "adj.", "甜的", "/swi:t/"],
    ["snack", "n.", "点心；小吃", "/snæk/"],
    ["of course", "—", "当然", "/kɔ:s/"],
    ["mobile", "adj.", "可移动的", "/ˈməʊbaɪl/"],
    ["mobile phone", "—", "手机", "/'məʊ. baɪl/ /fəʊn/"],
    ["turn off", "—", "关掉（水、电或煤气）", "/tɜ:n/ /ɒf/"],
    ["queue", "n.", "队", "/kju:/"],
    ["jump the queue", "—", "插队", "/dʒʌmp/ /ðə/ / kju:/"],
    ["feed", "v.", "喂养；饲养", "/fi:d/"],
    ["leave", "v.", "离开；留下", "/li:v/"],
    ["absent", "adj.", "缺席的；不在的", "/ˈæbsənt/"],
    ["absent from", "—", "缺席；不在", "/'æb.sənt/ /frɒm/"],
    ["shh", "interj.", "嘘（用以让别人安静下来）", "/ʃ/ (= sh)"],
    ["quietly", "adv.", "轻声地；安静地", "/ˈkwaɪətli/"],
    ["put on", "—", "戴上；穿上；增加", "/pʊt/ /ɒn/"],
    ["belt", "n.", "安全带；腰带；皮带", "/belt/"],
    ["noise", "n.", "声音；噪声", "/nɔɪz/"],
    ["unhappy", "adj.", "不快乐的", "/ʌnˈhæpi/"],
    ["Dr (= doctor)", "—", "博士；医生", "/'dɒk.tər/"],
    ["make sb's/the bed", "—", "整理床铺；铺床", "/meɪk/ /ðə/ / bed/"],
    ["either", "adv.", "也（用于否定词组后）", "/ˈaɪðə(r); ˈi:ðə(r)/"],
    ["practise", "v.", "训练；练习", "/ˈpræktɪs/"],
    ["hang", "v.", "悬挂", "/hæŋ/"],
    ["hang out", "—", "闲逛；常去某处", "/hæŋ/ /aʊt/"],
    ["weekday", "n.", "工作日（星期一至星期五的任何一天）", "/ˈwi:kdeɪ/"],
    ["awful", "adj.", "糟糕的；讨厌的", "/ˈɔ:fl/"],
    ["become", "v.", "变成；成为", "/bɪˈkʌm/"],
    ["better", "adj.", "较好的", "/ˈbetə(r)/"],
    ["better", "adv.", "较好地", "/ˈbetə(r)/"],
    ["person", "n.", "人", "/ˈpɜ:sn/"],
    ["focus", "v.", "集中（注意力、精力等）；聚焦", "/ˈfəʊkəs/"],
    ["focus on", "—", "集中（注意力、精力等）于", "/'fəʊ.kəs//ɒn/"],
    ["build", "v.", "创建；建造", "/bɪld/"],
    ["spirit", "n.", "精神；情绪", "/ˈspɪrɪt/"],
    ["think about", "—", "思考；考虑", "/θɪŋk/ /ə'baʊt/"],
    ["relax", "v.", "放松；休息", "/rɪˈlæks/"],
    ["advice", "n.", "建议；意见", "/ədˈvaɪs/"],
    ["understand", "v.", "理解；领会", "/ˌʌndəˈstænd/"],
    ["untidy", "adj.", "不整洁的", "/ʌnˈtaɪdi/"],
    ["Mary", "—", "玛丽", "/ˈmeəri/"],
    ["Tony", "—", "托尼", "/ˈtəʊni/"],
    ["Anne", "—", "安妮", "/æn/"],
    ["Eric", "—", "埃里克", "/ˈerɪk/"],
  ],
  'g7b-u3': [
    ["fit", "adj.", "健康的；健壮的", "/fɪt/"],
    ["fit", "v.", "适合", "/fɪt/"],
    ["baseball", "n.", "棒球（运动）", "/ˈbeɪsbɔ:l/"],
    ["glove", "n.", "（手指分开的）手套", "/ɡlʌv/"],
    ["mat", "n.", "垫子", "/mæt/"],
    ["rope", "n.", "绳子；粗绳", "/rəʊp/"],
    ["jump rope", "—", "跳绳用的绳子；跳绳（运动）", "/dʒʌmp/ /rəʊp/"],
    ["racket", "n.", "（网球、羽毛球等的）球拍", "/ˈrækɪt/"],
    ["hardly", "adv.", "几乎不；几乎没有", "/ˈhɑ:dli/"],
    ["ever", "adv.", "在任何时候；从来；曾经", "/ˈevə(r)/"],
    ["hardly ever", "—", "几乎从不", "/'hɑ:d. li/"],
    ["once", "adv.", "一次；曾经", "/wʌns/"],
    ["once", "conj.", "一旦", "/wʌns/"],
    ["twice", "adv.", "两次；两倍", "/twaɪs/"],
    ["mine", "pron.", "我的（所有物）", "/maɪn/"],
    ["hers", "pron.", "她的（所有物）", "/hɜ:z; ɜ:z/"],
    ["maybe", "adv.", "也许；大概", "/ˈmeɪbi/"],
    ["well-used", "adj.", "使用得多的", "/ˌwelˈju:zd/"],
    ["practice", "n.", "练习；实践", "/ˈpræktɪs/"],
    ["perfect", "adj.", "完美的；极好的", "/ˈpɜ:fɪkt/"],
    ["seldom", "adv.", "很少；不常", "/ˈseldəm/"],
    ["badminton", "n.", "羽毛球运动", "/ˈbædmɪntən/"],
    ["double", "n.", "双打（ doubles ）；两倍", "/ˈdʌbl/"],
    ["double", "adj.", "成双的；两倍的", "/ˈdʌbl/"],
    ["sometime", "adv.", "在某个时候", "/ˈsʌmtaɪm/"],
    ["volleyball", "n.", "排球（运动）", "/ˈvɒlibɔ:l/"],
    ["theirs", "pron.", "他们的，她们的，它们的（所有物）", "/ðeəz/"],
    ["ours", "pron.", "我们的（所有物）", "/ˈaʊəz; ɑ:z/"],
    ["jog", "v.", "慢跑", "/dʒɒɡ/"],
    ["few", "adj.", "（表示否定的）很少的；几乎没有的", "/fju:/"],
    ["a few", "—", "少数；几个", "/ə// fju:/"],
    ["excuse", "v.", "原谅；宽恕", "/ɪkˈskju:z/"],
    ["excuse me", "—", "劳驾；请原谅", "/ɪk' skju:z/ / mi/"],
    ["over there", "—", "在那边", "/'əʊ.vər/ /ðeər/"],
    ["just", "adv.", "只是；正好", "/dʒʌst/"],
    ["T-shirt", "n.", "T 恤衫", "/ˈti: ʃɜ:t/"],
    ["belong", "v.", "应在（某处）", "/bɪˈlɒŋ/"],
    ["belong to", "—", "属于（某人）", "/bɪ'lɒŋ/ / tu:/"],
    ["working", "adj.", "工作的", "/ˈwɜ:kɪŋ/"],
    ["working day", "—", "工作日", "/ˌwɜː. kɪŋ'deɪ/"],
    ["full of", "—", "有许多；充满", "/fʊl/ /əv/"],
    ["energy", "n.", "精力；能量", "/ˈenədʒi/"],
    ["group", "n.", "组；群", "/ɡru:p/"],
    ["skateboard", "n.", "滑板", "/ˈskeɪtbɔ:d/"],
    ["encourage", "v.", "鼓励；激励", "/ɪnˈkʌrɪdʒ/"],
    ["trick", "n.", "技巧；戏法", "/trɪk/"],
    ["succeed", "v.", "成功；达到目标", "/səkˈsi:d/"],
    ["skateboarding", "n.", "滑板运动", "/ˈskeɪtbɔ:dɪŋ/"],
    ["goal", "n.", "目标；目的", "/ɡəʊl/"],
    ["sit-up", "n.", "仰卧起坐", "/ˈsɪtʌp/"],
    ["work out", "—", "锻炼", "/wɜːk/ /aʊt/"],
    ["app", "n.", "应用程序", "/æp/ (= application /ˌæplɪˈkeɪʃn/)"],
    ["progress", "n.", "进步；进展", "/ˈprəʊɡres/"],
    ["match", "n.", "比赛；竞赛", "/mætʃ/"],
    ["team", "n.", "队；组", "/ti:m/"],
    ["lose", "v.", "输掉；丢失", "/lu:z/"],
    ["teenager", "n.", "青少年", "/ˈti:neɪdʒə(r)/"],
    ["Steve", "—", "史蒂夫", "/sti:v/"],
  ],
  'g7b-u4': [
    ["watermelon", "n.", "西瓜", "/ˈwɔ:təˌmelən/"],
    ["cabbage", "n.", "卷心菜", "/ˈkæbɪdʒ/"],
    ["mutton", "n.", "羊肉", "/ˈmʌtn/"],
    ["cookie", "n.", "曲奇饼", "/ˈkʊki/"],
    ["onion", "n.", "洋葱；葱头", "/ˈʌnjən/"],
    ["dumpling", "n.", "饺子", "/ˈdʌmplɪŋ/"],
    ["coffee", "n.", "咖啡", "/ˈkɒfi/"],
    ["bean", "n.", "豆", "/bi:n/"],
    ["chip", "n.", "炸薯条", "/tʃɪp/"],
    ["fish and chips", "—", "炸鱼薯条", "/fɪʃ/ /ənd/ /tʃɪps/"],
    ["salad", "n.", "沙拉；色拉", "/ˈsæləd/"],
    ["porridge", "n.", "粥；麦片粥", "/ˈpɒrɪdʒ/"],
    ["waiter", "n.", "（男）服务员", "/ˈweɪtə(r)/"],
    ["What about ...?", "—", "…… 怎么样？", "/wɒt/ /ə'baʊt/"],
    ["taste", "v.", "有 …… 味道；尝", "/teɪst/"],
    ["taste", "n.", "味道", "/teɪst/"],
    ["anything", "pron.", "某事物；任何事物", "/ˈeniθɪŋ/"],
    ["dish", "n.", "一道菜；盘子", "/dɪʃ/"],
    ["choice", "n.", "选择", "/tʃɔɪs/"],
    ["meal", "n.", "一餐所吃的食物；一餐", "/mi:l/"],
    ["pork", "n.", "猪肉", "/pɔ:k/"],
    ["strawberry", "n.", "草莓", "/ˈstrɔ:bəri/"],
    ["menu", "n.", "菜单", "/ˈmenju:/"],
    ["customer", "n.", "顾客", "/ˈkʌstəmə(r)/"],
    ["serve", "v.", "提供；服务", "/sɜ:v/"],
    ["waitress", "n.", "女服务员", "/ˈweɪtrəs/"],
    ["sir", "n.", "先生", "/sɜ:(r)/"],
    ["bill", "n.", "账单；钞票", "/bɪl/"],
    ["go with", "—", "搭配；相配", "/gəʊ/ /wɪð/"],
    ["instead", "adv.", "反而；代替", "/ɪnˈsted/"],
    ["pear", "n.", "梨", "/peə(r)/"],
    ["too much", "—", "太多", "/ tu://mʌtʃ/"],
    ["sugar", "n.", "糖", "/ˈʃʊɡə(r)/"],
    ["newsletter", "n.", "内部通讯；简讯", "/ˈnju:zletə(r)/"],
    ["improve", "v.", "改进；改善", "/ɪmˈpru:v/"],
    ["habit", "n.", "习惯", "/ˈhæbɪt/"],
    ["fast food", "—", "快餐", "/fɑːst// fu:d/"],
    ["salt", "n.", "盐", "/sɔ:lt; sɑ:lt/"],
    ["fat", "n.", "脂肪", "/fæt/"],
    ["fat", "adj.", "肥胖的", "/fæt/"],
    ["weight", "n.", "体重；重量", "/weɪt/"],
    ["hamburger", "n.", "汉堡包", "/ˈhæmbɜ:ɡə(r)/"],
    ["cause", "v.", "造成；导致", "/kɔ:z/"],
    ["heart", "n.", "心脏；中心", "/hɑ:t/"],
    ["balanced", "adj.", "均衡的；平衡的", "/ˈbælənst/"],
    ["too ... to", "—", "太 …… 以至于不能", "/ tu:// tu:/"],
    ["sleepy", "adj.", "困倦的；想睡的", "/ˈsli:pi/"],
    ["after all", "—", "毕竟；终归", "/'ɑːf.tər/ /ɔ:l/"],
    ["away", "adv.", "离开；在别处", "/əˈweɪ/"],
    ["poor", "adj.", "不好的；贫穷的；可怜的", "/pɔ:(r); pʊə(r)/"],
    ["result", "n.", "后果；结果", "/rɪˈzʌlt/"],
    ["article", "n.", "文章；冠词", "/ˈɑ:tɪkl/"],
    ["common", "adj.", "共同的；普通的", "/ˈkɒmən/"],
    ["among", "prep.", "在 …… 中； …… 之一", "/əˈmʌŋ/"],
    ["soft", "adj.", "柔和的；柔软的", "/sɒft/"],
    ["soft drink", "—", "软饮料（不含酒精）", "/sɒft/ /drɪŋk/"],
    ["enough", "adj.", "足够的；充足的", "/ɪˈnʌf/"],
    ["enough", "adv.", "足够地；充分地", "/ɪˈnʌf/"],
    ["enough", "pron.", "足够；充分", "/ɪˈnʌf/"],
    ["thirsty", "adj.", "渴的", "/ˈθɜ:sti/"],
    ["Gongbao chicken", "n.", "宫保鸡丁", "/ˌɡɒŋbaʊ ˈtʃɪkɪn/"],
    ["America", "—", "美国；美洲", "/əˈmerɪkə/"],
    ["Dongpo pork", "n.", "东坡肉", "/ˌdɒŋpɔː ˈpɔːk/"],
    ["Joy Clinic", "—", "快乐诊所", "/dʒɔɪ/ /ˈklɪnɪk/"],
  ],
  'g7b-u5': [
    ["right now", "—", "现在；立刻", "/raɪt/ /naʊ/"],
    ["ride", "v.", "骑", "/raɪd/"],
    ["ride", "n.", "旅程", "/raɪd/"],
    ["moment", "n.", "某个时刻；片刻；瞬间", "/ˈməʊmənt/"],
    ["at the moment", "—", "现在；此刻", "/æt//ðə//'məʊ.mənt/"],
    ["work on", "—", "做；从事", "/wɜːk/ /ɒn/"],
    ["dragon", "n.", "龙", "/ˈdræɡən/"],
    ["festival", "n.", "节日", "/ˈfestɪvl/"],
    ["hold", "v.", "拿着；抓住", "/həʊld/"],
    ["hold on", "—", "别挂断电话；等一等", "/həʊld/ /ɒn/"],
    ["voice", "n.", "嗓音；声音", "/vɔɪs/"],
    ["race", "n.", "比赛；竞赛", "/reɪs/"],
    ["darling", "n.", "亲爱的；宝贝", "/ˈdɑ:lɪŋ/"],
    ["somebody", "pron.", "某人；有人", "/ˈsʌmbədi/"],
    ["could", "modal v.", "能；可以", "/kʊd; kəd/"],
    ["message", "n.", "消息；信息", "/ˈmesɪdʒ/"],
    ["take a message", "—", "捎个口信", "/teɪk//ə//' mes.ɪdʒ/"],
    ["leave a message", "—", "留个口信", "/ li:v/ lə//' mes.ɪdʒ/"],
    ["call back", "—", "回电话", "/kɔ:l/ /bæk/"],
    ["kick", "v.", "踢；踹", "/kɪk/"],
    ["wow", "interj.", "哇；呀", "/waʊ/"],
    ["online", "adj.", "在线的", "/ˌɒnˈlaɪn/"],
    ["shuttlecock", "n.", "羽毛球", "/ˈʃʌtlkɒk/"],
    ["sight", "n.", "名胜；风景；视力", "/saɪt/"],
    ["exam", "n.", "考试", "/ɪɡˈzæm/ (= examination /ɪɡˌzæmɪˈneɪʃn/)"],
    ["hope", "v. & n.", "希望", "/həʊp/"],
    ["forward", "adv.", "向前", "/ˈfɔ:wəd/"],
    ["look forward to", "—", "盼望", "/lʊk//'fɔ:.wəd// tu:/"],
    ["skate", "v.", "滑冰", "/skeɪt/"],
    ["happen", "v.", "发生", "/ˈhæpən/"],
    ["zone", "n.", "地区；地带；区域", "/zəʊn/"],
    ["time zone", "—", "时区", "/'taɪmˌzəʊn/"],
    ["around the world", "—", "世界各地", "/ə'raʊnd//ðə//wɜ: ld/"],
    ["rush", "v. & n.", "冲；奔", "/rʌʃ/"],
    ["in a hurry", "—", "匆忙", "/ɪn/ /ə/ /'hʌr. i/"],
    ["shine", "v.", "发光；照耀", "/ʃaɪn/"],
    ["shine", "n.", "光亮", "/ʃaɪn/"],
    ["brightly", "adv.", "明亮地", "/ˈbraɪtli/"],
    ["colourful", "adj.", "色彩鲜艳的", "/ˈkʌləfl/"],
    ["slowly", "adv.", "缓慢地", "/ˈsləʊli/"],
    ["such", "adj.", "这样的；那样的", "/sʌtʃ/"],
    ["such", "pron.", "这样（那样）的人或事物", "/sʌtʃ/"],
    ["such as", "—", "例如", "/sʌtʃ/ /æz/"],
    ["painting", "n.", "绘画作品；绘画；油画", "/ˈpeɪntɪŋ/"],
    ["market", "n.", "市场", "/ˈmɑ:kɪt/"],
    ["side", "n.", "边；侧", "/saɪd/"],
    ["side by side", "—", "并排；并肩地", "/saɪd/ /baɪ/ /saɪd/"],
    ["rush hour", "—", "（上下班时的）交通高峰期", "/'rʌʃˌaʊər/"],
    ["subway", "n.", "地铁", "/ˈsʌbweɪ/"],
    ["bright", "adj.", "鲜艳的；明亮的；聪明的", "/braɪt/"],
    ["drop", "v.", "运送；落下", "/drɒp/"],
    ["drop", "n.", "滴；下降", "/drɒp/"],
    ["drop off", "—", "（开车）把某人送到某处", "/drɒp//ɒf/"],
    ["passenger", "n.", "乘客", "/ˈpæsɪndʒə(r)/"],
    ["central", "adj.", "中心的；中央的", "/ˈsentrəl/"],
    ["explain", "v.", "解释；说明", "/ɪkˈspleɪn/"],
    ["take part in", "—", "参加", "/teɪk/ /pɑːt/ /ɪn/"],
    ["tour", "n. & v.", "旅行；旅游", "/tʊə(r)/"],
    ["sunshine", "n.", "阳光", "/ˈsʌnʃaɪn/"],
    ["drive", "v.", "开车；驾驶", "/draɪv/"],
    ["Adam", "—", "亚当", "/ˈædəm/"],
    ["Dragon Boat Festival", "—", "端午节", "/ˈdræɡən bəʊt ˈfestɪvl/"],
    ["Beth", "—", "贝丝", "/beθ/"],
    ["Nairobi", "—", "内罗毕（肯尼亚首都）", "/ˌnaɪˈrəʊbɪ/"],
    ["New York", "—", "纽约", "/ˌnju: ˈjɔ:k/"],
    ["Kenya", "—", "肯尼亚", "/ˈkenjə/"],
    ["USA", "—", "美国", "/ˌju:esˈeɪ/"],
    ["Central Park", "—", "中央公园", "/ˌsentrəl ˈpɑːk/"],
  ],
  'g7b-u6': [
    ["rain or shine", "—", "不论是雨或是晴；不管发生什么事", "/reɪn/ /ɔ:r/ /ʃaɪn/"],
    ["affect", "v.", "影响", "/əˈfekt/"],
    ["dry", "adj.", "干的；干旱的", "/draɪ/"],
    ["lightning", "n.", "闪电", "/ˈlaɪtnɪŋ/"],
    ["stormy", "adj.", "有暴风雨（或暴风雪）的", "/ˈstɔ:mi/"],
    ["north", "n.", "北部；北；北方", "/nɔ:θ/"],
    ["west", "n.", "西部；西；西方", "/west/"],
    ["south", "n.", "南部；南；南方", "/saʊθ/"],
    ["east", "n.", "东部；东；东方", "/i:st/"],
    ["stay in", "—", "待在家里；没有外出", "/steɪ/ /ɪn/"],
    ["lucky", "adj.", "运气好的；带来好运的", "/ˈlʌki/"],
    ["lucky you", "—", "你真幸运", "/'lʌk. i/ / ju:/"],
    ["sunbathe", "v.", "沐日光浴；晒太阳", "/ˈsʌnbeɪð/"],
    ["some day", "—", "将来；有朝一日", "/sʌm//deɪ/"],
    ["temperature", "n.", "温度", "/ˈtemprətʃə(r)/"],
    ["snowman", "n.", "(pl. snowmen /ˈsnəʊmen/)  雪人", "/ˈsnəʊmæn/"],
    ["heavily", "adv.", "大量地；沉重地", "/ˈhevɪli/"],
    ["snowy", "adj.", "下雪的；雪白的", "/ˈsnəʊi/"],
    ["beach volleyball", "—", "沙滩排球", "/ bi:tʃ//'vɒl. i.bɔ:l/"],
    ["high", "adv. & adj.", "高", "/haɪ/"],
    ["freezing", "adj.", "极冷的；冰冻的", "/ˈfri:zɪŋ/"],
    ["tourist", "n.", "旅行者；观光客", "/ˈtʊərɪst/"],
    ["mount", "n.", "（在现代英语里仅用于地名）山；山峰", "/maʊnt/"],
    ["cloud", "n.", "云；云彩", "/klaʊd/"],
    ["feel like", "—", "感觉像", "/ fi:l/ /laɪk/"],
    ["magical", "adj.", "魔法的；神奇的", "/ˈmædʒɪkl/"],
    ["rock", "n.", "岩石", "/rɒk/"],
    ["rest", "n.", "休息；剩余部分", "/rest/"],
    ["area", "n.", "场地；地区", "/ˈeəriə/"],
    ["rest area", "—", "休息区", "/ rest//'eə. ri.ə/"],
    ["make progress", "—", "取得进展", "/meɪk//'prəʊ. gres/"],
    ["although", "conj.", "虽然；尽管", "/ɔ:lˈðəʊ/"],
    ["still", "adv.", "还；仍然", "/stɪl/"],
    ["in high spirits", "—", "情绪高涨；兴高采烈", "/ɪn/ /haɪ//'spɪr.ɪts/"],
    ["experience", "n.", "经历；经验", "/ɪkˈspɪəriəns/"],
    ["experience", "v.", "经历", "/ɪkˈspɪəriəns/"],
    ["through", "prep.", "穿过；凭借", "/θru:/"],
    ["glad", "adj.", "高兴的", "/ɡlæd/"],
    ["peak", "n.", "山顶；顶点", "/pi:k/"],
    ["grey", "adj.", "灰色的", "/ɡreɪ/ (AmE gray /ɡreɪ/)"],
    ["because of", "—", "因为", "/bɪ'kɒzˌəv/"],
    ["fog", "n.", "雾", "/fɒɡ/"],
    ["ground", "n.", "地面", "/ɡraʊnd/"],
    ["wet", "adj.", "湿的", "/wet/"],
    ["tiring", "adj.", "令人疲倦的；累人的", "/ˈtaɪərɪŋ/"],
    ["seem", "v.", "似乎；好像", "/si:m/"],
    ["sunlight", "n.", "阳光；日光", "/ˈsʌnlaɪt/"],
    ["at the top", "—", "在顶部；在顶端", "/æt/ /ðə/ /tɒp/"],
    ["description", "n.", "描述；说明", "/dɪˈskrɪpʃn/"],
    ["mountain", "n.", "山；高山", "/ˈmaʊntən/"],
    ["at the start", "—", "开始；起初", "/æt/ /ðə/ /stɑːt/"],
    ["end", "n.", "末尾；结束", "/end/"],
    ["at the end", "—", "最后；在末尾", "/æt/ /ðə/ / end/"],
    ["storm", "n.", "暴风雨；暴风雪", "/stɔ:m/"],
    ["pour", "v.", "倾倒；倒出", "/pɔ:(r)/"],
    ["wind", "n.", "风", "/wɪnd/"],
    ["shout", "v. & n.", "喊叫；呼唤", "/ʃaʊt/"],
    ["run after", "—", "追逐", "/rʌn//'ɑ:f.tər/"],
    ["Anna", "—", "安娜", "/ˈænə/"],
    ["John", "—", "约翰", "/dʒɒn/"],
    ["Stockholm", "—", "斯德哥尔摩（瑞典首都）", "/ˈstɒkhəʊm/"],
    ["Mount Huangshan", "—", "黄山", "/maʊnt ˌhwɑːŋˈʃæn/"],
    ["Bright Peak", "—", "光明顶", "/braɪt piːk/"],
  ],
  'g7b-u7': [
    ["meet up", "—", "碰头；相聚", "/ mi:t/ /ʌp/"],
    ["museum", "n.", "博物馆", "/mjuˈzi:əm/"],
    ["exhibition", "n.", "展览", "/ˌeksɪˈbɪʃn/"],
    ["direction", "n.", "方向", "/dəˈrekʃn; daɪˈrekʃn/"],
    ["trip", "n.", "旅行", "/trɪp/"],
    ["wastewater", "n.", "废水", "/ˈweɪstwɔ:tə(r)/"],
    ["plant", "n.", "工厂", "/plɑ:nt/"],
    ["into", "prep.", "到 …… 里面；进入", "/ˈɪntu; ˈɪntə/"],
    ["screen", "n.", "滤网；隔板；屏障", "/skri:n/"],
    ["remove", "v.", "移开；拿走", "/rɪˈmu:v/"],
    ["piece", "n.", "片；块", "/pi:s/"],
    ["waste", "n.", "废弃物", "/weɪst/"],
    ["waste", "v.", "浪费", "/weɪst/"],
    ["machine", "n.", "机器", "/məˈʃi:n/"],
    ["germ", "n.", "微生物；细菌", "/dʒɜ:m/"],
    ["step", "n.", "步骤；脚步", "/step/"],
    ["used to", "—", "过去常常（做）", "/ˈjuːst tə/"],
    ["realize", "v.", "认识到；实现", "/ˈriəlaɪz/ (= realise)"],
    ["inside", "prep.", "在 …… 里面", "/ˌɪnˈsaɪd/"],
    ["inside", "adv.", "在里面", "/ˌɪnˈsaɪd/"],
    ["go on a trip", "—", "去旅行", "/gəʊ/ /ɒn/ /ə/ /trɪp/"],
    ["process", "n.", "过程", "/ˈprəʊses/"],
    ["theatre", "n.", "戏院；剧场；电影院", "/ˈθɪətə(r)/"],
    ["factory", "n.", "工厂", "/ˈfæktri; ˈfæktəri/"],
    ["terrible", "adj.", "糟糕的", "/ˈterəbl/"],
    ["actor", "n.", "演员", "/ˈæktə(r)/"],
    ["gun", "n.", "枪", "/ɡʌn/"],
    ["try on", "—", "试穿", "/traɪ/ /ɒn/"],
    ["along", "prep.", "沿着；顺着", "/əˈlɒŋ/"],
    ["road", "n.", "道路", "/rəʊd/"],
    ["create", "v.", "创造", "/kriˈeɪt/"],
    ["record", "v.", "记录", "/rɪˈkɔ:d/"],
    ["record", "n.", "记录", "/ˈrekɔ:d/"],
    ["thought", "n.", "想法", "/θɔ:t/"],
    ["skill", "n.", "技能", "/skɪl/"],
    ["write down", "—", "写下；记下", "/raɪt/ /daʊn/"],
    ["explore", "v.", "探索", "/ɪkˈsplɔ:(r)/"],
    ["tent", "n.", "帐篷", "/tent/"],
    ["cucumber", "n.", "黄瓜", "/ˈkju:kʌmbə(r)/"],
    ["from ... to ...", "—", "从 …… 到 ……", "/frɒm/ / tu:/"],
    ["straight", "adv.", "直接；立即；笔直地", "/streɪt/"],
    ["straight", "adj.", "直的", "/streɪt/"],
    ["fill", "v.", "装满；盛满", "/fɪl/"],
    ["basket", "n.", "篮子；筐", "/ˈbɑ:skɪt/"],
    ["teach", "v.", "(taught /tɔ:t/)  教", "/ti:tʃ/"],
    ["branch", "n.", "分支；树枝", "/brɑ:ntʃ/"],
    ["leaf", "n.", "(pl. leaves /li:vz/)  叶；叶子", "/li:f/"],
    ["finally", "adv.", "终于", "/ˈfaɪnəli/"],
    ["think of", "—", "考虑；想起", "/θɪŋk/ /əv/"],
    ["grain", "n.", "谷物；谷粒", "/ɡreɪn/"],
    ["fresh", "adj.", "新鲜的", "/freʃ/"],
    ["certainly", "adv.", "肯定；当然", "/ˈsɜ:tnli/"],
    ["diary", "n.", "日记；日记本", "/ˈdaɪəri/"],
    ["entry", "n.", "（日记的）一则；入口", "/ˈentri/"],
    ["agree", "v.", "赞成；同意", "/əˈɡri:/"],
    ["agree with", "—", "赞成；同意", "/ə' gri:/ /wɪð/"],
  ],
  'g7b-u8': [
    ["upon", "prep.", "在 …… 上", "/əˈpɒn/"],
    ["once upon a time", "—", "从前；很久以前", "/wʌns/ /ə'pɒn/ /ə//taɪm/"],
    ["bite", "v.", "(bit /bɪt/)  咬；咬伤", "/baɪt/"],
    ["bite through", "—", "咬穿", "/baɪt/ /θru:/"],
    ["net", "n.", "网；网状物", "/net/"],
    ["hunter", "n.", "猎人；搜寻者", "/ˈhʌntə(r)/"],
    ["promise", "v.", "承诺；保证", "/ˈprɒmɪs/"],
    ["promise", "n.", "承诺；诺言", "/ˈprɒmɪs/"],
    ["long ago", "—", "很久以前", "/lɒŋ//ə'gəʊ/"],
    ["war", "n.", "战争", "/wɔ:(r)/"],
    ["neighbour", "n.", "邻居", "/ˈneɪbə(r)/"],
    ["wise", "adj.", "明智的；高明的", "/waɪz/"],
    ["emperor", "n.", "皇帝", "/ˈempərə(r)/"],
    ["lie", "v.", "撒谎", "/laɪ/"],
    ["lie", "n.", "谎言", "/laɪ/"],
    ["pretend", "v.", "假装；伪装", "/prɪˈtend/"],
    ["official", "n.", "官员；高级职员", "/əˈfɪʃl/"],
    ["silly", "adj.", "愚蠢的；傻的", "/ˈsɪli/"],
    ["decide", "v.", "决定", "/dɪˈsaɪd/"],
    ["praise", "v. & n.", "赞美；表扬", "/preɪz/"],
    ["afraid", "adj.", "害怕的；担心的", "/əˈfreɪd/"],
    ["suddenly", "adv.", "突然地；出乎意料地", "/ˈsʌdənli/"],
    ["at first", "—", "起初；最初", "/æt//'fɜːst/"],
    ["truth", "n.", "真相；事实", "/tru:θ/"],
    ["tell the truth", "—", "说实话", "/ tel/ /ðə/ / tru:θ/"],
    ["make money", "—", "赚钱", "/meɪk//'mʌn. i/"],
    ["true", "adj.", "符合事实的；真正的", "/tru:/"],
    ["hate", "v.", "不喜欢；厌恶；讨厌", "/heɪt/"],
    ["get out", "—", "逃脱；离开", "/ get/ /aʊt/"],
    ["king", "n.", "君主；国王", "/kɪŋ/"],
    ["artist", "n.", "美术家；艺术家", "/ˈɑ:tɪst/"],
    ["quickly", "adv.", "快速地；很快", "/ˈkwɪkli/"],
    ["smile", "v.", "微笑", "/smaɪl/"],
    ["smile", "n.", "微笑；笑容", "/smaɪl/"],
    ["all over", "—", "到处；遍及", "/ɔ:l//'əʊ.vər/"],
    ["ugly", "adj.", "丑陋的；难看的", "/ˈʌɡli/"],
    ["duckling", "n.", "小鸭子", "/ˈdʌklɪŋ/"],
    ["real", "adj.", "真的；真正的", "/rɪəl/"],
    ["laugh at", "—", "嘲笑", "/lɑ:f/ /æt/"],
    ["go away", "—", "走开", "/gəʊ/ /ə'weɪ/"],
    ["search", "v.", "寻找；搜寻", "/sɜ:tʃ/"],
    ["search for", "—", "寻找", "/sɜːtʃ/ /fɔ:r/"],
    ["hen", "n.", "母鸡", "/hen/"],
    ["hopefully", "adv.", "有希望地", "/ˈhəʊpfəli/"],
    ["purr", "v.", "（猫）发出呼噜声", "/pɜ:(r)/"],
    ["lay", "v.", "(laid /leɪd/)  下（蛋）；放置；搁", "/leɪ/"],
    ["swan", "n.", "天鹅", "/swɒn/"],
    ["feather", "n.", "羽毛", "/ˈfeðə/"],
    ["to sb's surprise", "—", "出乎某人的意料", "/ tu:/ /sə'praɪz/"],
    ["size", "n.", "大小；尺寸", "/saɪz/"],
    ["only", "adv.", "只有", "/ˈəʊnli/"],
    ["fisherman", "n.", "(pl. fishermen /ˈfɪʃəmən/)  渔夫", "/ˈfɪʃəmən/"],
    ["fishing", "n.", "钓鱼；捕鱼", "/ˈfɪʃɪŋ/"],
    ["come out", "—", "出现；盛开", "/kʌm//aʊt/"],
    ["genie", "n.", "妖怪；鬼", "/ˈdʒi:ni/"],
    ["die", "v.", "死亡；消失", "/daɪ/"],
    ["make a promise", "—", "许下诺言", "/meɪk//ə//'prɒm.ɪs/"],
    ["someone", "pron.", "某人；有人", "/ˈsʌmwʌn/"],
    ["set", "v.", "使处于某种状况；使开始", "/set/"],
    ["set ... free", "—", "释放", "/ set/ / fri:/"],
    ["rich", "adj.", "富有的；富含 …… 的", "/rɪtʃ/"],
    ["powerful", "adj.", "强大的；有影响力的", "/ˈpaʊəfl/"],
    ["anyone", "pron.", "任何人；某个人", "/ˈeniwʌn/"],
    ["instead of", "—", "而不是；代替", "/ɪn' stedˌəv/"],
    ["succeed in doing sth", "—", "成功做成某事", "/sək' si:d/ /ɪn//' du:.ɪŋ//'sʌm.θɪŋ/"],
    ["himself", "pron.", "他自己；他本人", "/hɪmˈself/"],
    ["in the end", "—", "最后；终究", "/ɪn/ /ðə/ / end/"],
    ["Hans Christian Andersen", "—", "汉斯 · 克里斯蒂安 · 安徒生", "/hænz/ /ˈkrɪstʃən/ /ˈændəsən/"],
    ["believe", "v.", "相信；认为", "/bɪ' li:v/"],
    ["only if", "phr.", "只有", "/'əʊn. li//ɪf/"],
  ],
};

const GRADE_G8A_UNIT_TITLES = ["Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7","Unit 8","Unit 9","Unit 10"];

const RAW_WORDS_G8A = {
  'g8a-u1': [
    ["anyone", "pron.", "任何人", "/' en. i. wʌn/"],
    ["anywhere", "adv.", "在任何地方", "/' en. i.weər/"],
    ["wonderful", "adj.", "精彩的；绝妙的", "/'wʌn.də.fəl/"],
    ["few", "adj.& pron.", "不多; 很少", "/ fju:/"],
    ["quite a few", "adj. phr.", "相当多; 不少", "/kwaɪt/ /ə/ / fju:/"],
    ["most", "adj.", ", adv.& pron.最多; 大多数", "/məʊst/"],
    ["something", "pron.", "某事; 某物", "/'sʌm.θɪŋ/"],
    ["nothing", "pron.", "没有什么；没有一件东西", "/'nʌθ.ɪŋ/"],
    ["everyone", "pron.", "每人；人人；所有人", "/' ev. ri. wʌn/"],
    ["of course", "adv.", "当然; 自然", "/ɒv/ /kɔ:s/"],
    ["myself", "pron.", "我自己；我本人", "/maɪ' self/"],
    ["yourselfpl.yourselves", "pron.", "你自己；您自己", "/jɔ:' self/"],
    ["hen", "n.", "母鸡", "/ hen/"],
    ["pig", "n.", "猪", "/pɪg/"],
    ["seem", "v.", "好像；似乎；看来", "/ si:m/"],
    ["bored", "adj.", "厌倦的；烦闷的", "/bɔ:d/"],
    ["someone", "pron.", "某人", "/'sʌm. wʌn/"],
    ["diary", "n.", "日记；记事簿", "/'daɪə. ri/"],
    ["enjoyable", "adj.", "有乐趣的；令人愉快的", "/ɪn'dʒɔɪ.ə.bəl/"],
    ["activity", "n.", "活动", "/æk'tɪv.ə. ti/"],
    ["decide", "v.", "决定；选定", "/dɪ'saɪd/"],
    ["try", "v.&n.", "尝试; 设法; 努力", "/traɪ/"],
    ["paragliding", "n.", "滑翔伞运动", "/'pær.əˌglaɪ. dɪŋ/"],
    ["feel like", "v.", "给……的感觉；感受到", "/ fi:l/ /laɪk/"],
    ["bird", "n.", "鸟", "/bɜːd/"],
    ["bicycle", "n.", "自行车；脚踏车", "/'baɪ. sɪ.kəl/"],
    ["building", "n.", "建筑物；房子", "/'bɪl. dɪŋ/"],
    ["trader", "n.", "商人", "/'treɪ.dər/"],
    ["wonder", "v.", "想知道；琢磨", "/'wʌn.dər/"],
    ["difference", "n.", "差别；差异", "/'dɪf.ər.əns/"],
    ["top", "n.", "顶部；表面", "/tɒp/"],
    ["wait", "v.", "等待；等候", "/weɪt/"],
    ["umbrella", "n.", "伞；雨伞", "/ʌm' brel.ə/"],
    ["wet", "adj.", "湿的；潮湿的；下雨的", "/ wet/"],
    ["because of", "phr.", "因为", "/bɪ'kɒzˌəv/"],
    ["below", "prep.", "在……下面; 到……下面", "/bɪ'ləʊ/"],
    ["enough", "adj.& adv.", "足够的(地);充足的(地)；充分的(地)", "/ɪ'nʌf/"],
    ["hungry", "adj.", "饥饿的", "/'hʌŋ. gri/"],
    ["as", "adv.", "像……一样; 如同conj.当……时; 如同", "/æz/"],
    ["hill", "n.", "小山；山丘", "/hɪl/"],
    ["duck", "n.", "鸭", "/dʌk/"],
    ["dislike", "v.&n.", "不喜爱/厌恶(的事物)", "/dɪ'slaɪk/"],
  ],
  'g8a-u2': [
    ["housework", "n.", "家务劳动；家务事", "/'haʊs. wɜːk/"],
    ["hardly", "adv.", "几乎不；几乎没有", "/'hɑ:d. li/"],
    ["ever", "adv.", "在任何时候；从来；曾经", "/' ev.ər/"],
    ["hardly ever", "adv.", "几乎从不", "/'hɑːd. li//' ev.ər/"],
    ["once", "adv.", "一次; 曾经", "/wʌns/"],
    ["twice", "adv.", "两次; 两倍", "/twaɪs/"],
    ["Internet", "n.", "(国际)互联网；因特网", "/'ɪn.tə.net/"],
    ["program", "n.", "节目", "/'prəʊ.græm//'prəʊ.græm/"],
    ["full", "adj.", "忙的；满的；充满的", "/fʊl/"],
    ["swing(swung)", "n.", "摆动；秋千v.(使)摆动；摇摆", "/swɪŋ/(/swʌŋ/)"],
    ["swing dance", "n.", "摇摆舞", "/swɪŋ/ /dɑ: ns/"],
    ["maybe", "adv.", "大概；或许；可能", "/'meɪ. bi/"],
    ["least", "adv.", "最小; 最少adj.& pron.最小的; 最少的", "/ li: st/"],
    ["at least", "adv. phr.", "至少; 不少于; 起码", "/æt/ / li: st/"],
    ["junk", "n.", "无用的东西；无价值的东西", "/dʒʌŋk/"],
    ["junk food", "n.", "垃圾食品", "/'dʒʌŋk ˌ fu:d/"],
    ["coffee", "n.", "咖啡", "/'kɒf. i/"],
    ["health", "n.", "健康；人的身体(或精神)状态", "/helθ/"],
    ["result", "n.", "结果；后果", "/rɪ'zʌlt/"],
    ["percent/ per cent", "n.", "百分之……", "/pə' sent/"],
    ["online", "adj.& adv.", "在线(的); 联网(的)", "/'ɒn. laɪn/"],
    ["television", "n.", "电视节目；电视机", "/' tel.ɪ. vɪʒ.ən/"],
    ["although", "conj.", "虽然; 尽管; 即使", "/ɔ:l'ðəʊ/"],
    ["through", "prep.", "以; 凭借; 穿过", "/θru:/"],
    ["mind", "n.", "头脑；心智", "/maɪnd/"],
    ["body", "n.", "身体", "/'bɒd. i/"],
    ["such", "adj.& pron.", "这样的; 那样的;类似的", "/sʌtʃ/"],
    ["such as", "phr.", "例如; 像……这样", "/sʌtʃ/ /æz/"],
    ["together", "adv.", "在一起；共同", "/tə'geð.ər/"],
    ["die", "v.", "消失；灭亡；死亡", "/daɪ/"],
    ["writer", "n.", "作者；作家", "/'raɪ.tər/"],
    ["dentist", "n.", "牙科医生", "/' den. tɪst/"],
    ["magazine", "n.", "杂志；期刊", "/ˌmæg.ə' zi:n/"],
    ["however", "adv.", "然而; 不过", "/ˌhaʊ' ev.ər/"],
    ["than", "prep.& conj.", "(用以引出比较的第二部分)比", "/ðæn/"],
    ["more than", "adv. phr.", "多于", "/mɔ:r/ /ðæn/"],
    ["almost", "adv.", "几乎；差不多", "/'ɔ:l. məʊst/"],
    ["none", "pron.", "没有一个；毫无", "/nʌn/"],
    ["less", "adv.", "较少; 较小 adj.& pron.较少的；更少的", "/ les/"],
    ["less than", "adv. phr.", "少于", "/ les/ /ðæn/"],
    ["point", "n.", "得分；点v.指；指向", "/pɔɪnt/"],
  ],
  'g8a-u3': [
    ["outgoing", "adj.", "爱交际的；友好的；外向的", "/ˌaʊt'gəʊ.ɪŋ/"],
    ["both", "adj.& pron.", "两个; 两个都", "/bəʊθ/"],
    ["better(good, well的比较级)", "adj.& adv.", "较好的(地);更好的(地)", "/' bet.ər/"],
    ["loudly", "adv.", "喧闹地；大声地；响亮地", "/'laʊd. li/"],
    ["quietly", "adv.", "轻声地；轻柔地；安静地", "/'kwaɪət. li/"],
    ["hard-working", "adj.", "工作努力的；辛勤的", "/ˌhɑːd'wɜː. kɪŋ/"],
    ["competition", "n.", "比赛；竞赛；竞争", "/ˌkɒm.pə'tɪʃ.ən/"],
    ["fantastic", "adj.", "极好的；了不起的", "/fæn'tæs. tɪk/"],
    ["which", "pron.& adj.", "哪一个; 哪一些", "/wɪtʃ/"],
    ["clearly", "adv.", "清楚地；清晰地；明白地", "/'klɪə. li/"],
    ["win (won)", "v.", "获胜；赢；赢得", "/wɪn/ (/wʌn/)"],
    ["though", "adv.", "不过；可是；然而conj.虽然; 尽管; 不过", "/ðəʊ/"],
    ["talented", "adj.", "有才能的；有才干的", "/'tæl.ən. tɪd/"],
    ["truly", "adv.", "真正; 确实", "/' tru:. li/"],
    ["care", "v.", "在意；担忧；关心", "/keər/"],
    ["care about", "v. phr.", "关心; 在意", "/keər/ /ə'baʊt/"],
    ["laugh", "v.", "笑;发笑 n.笑声", "/lɑ:f/"],
    ["serious", "adj.", "严肃的；稳重的", "/'sɪə. ri.əs/"],
    ["mirror", "n.", "镜子", "/'mɪr.ər/"],
    ["kid", "n.", "小孩；年轻人", "/kɪd/"],
    ["as long as", "conj.", "只要; 既然", "/æz/ /lɒŋ/ /æz/"],
    ["necessary", "adj.", "必需的；必要的", "/' nes.ə. ser. i/"],
    ["be different from", "v. phr.", "与………不同; 与……有差异", "/ bi://'dɪf.ər.ənt//frɒm/"],
    ["bring out", "v. phr.", "使显现;使表现出", "/brɪŋ/ /aʊt/"],
    ["grade", "n.", "成绩等级；评分等级", "/greɪd/"],
    ["should", "", "modal v.应该; 应当; 可以", "/ʃʊd/"],
    ["the same as", "phr.", "和……相同; 与……一致", "/ðə//seɪm/ /æz/"],
    ["saying", "n.", "谚语；格言；警句", "/'seɪ.ɪŋ/"],
    ["reach", "v.", "伸手；到达；抵达", "/ ri:tʃ/"],
    ["hand", "n.", "手", "/hænd/"],
    ["touch", "v.", "感动；触摸", "/tʌtʃ/"],
    ["heart", "n.", "内心；心脏", "/hɑ:t/"],
    ["fact", "n.", "现实；事实", "/fækt/"],
    ["in fact", "adv.", "确切地说；事实上；实际上", "/ɪn/ /fækt/"],
    ["break(broke)", "v.", "(使)破; 裂; 碎; 损坏", "/breɪk/ (/brəʊk/)"],
    ["arm", "n.", "手臂；上肢", "/ɑ:m/"],
    ["share", "v.", "分享；共享；共用；分摊", "/ʃeər/"],
    ["loud", "adj.", "响亮的；大声的", "/laʊd/"],
    ["similar", "adj.", "相像的；类似的", "/'sɪm.ɪ.lər/"],
    ["be similar to", "v. phr.", "与……相像的、类似的", "/ bi://'sɪm.ɪ.lər// tu:/"],
    ["primary", "adj.", "最初的；最早的", "/'praɪ.mər. i/"],
    ["primary school", "n. phr.", "小学", "/'praɪ.mər. i// sku:l/"],
    ["information", "n.", "信息；消息", "/ˌɪn.fə'meɪ.ʃən/"],
  ],
  'g8a-u4': [
    ["theater/ theatre", "n.", "戏院；剧场", "/'θɪə.tər/"],
    ["comfortable", "adj.", "使人舒服的；舒适的", "/'kʌm.fə.tə.bəl/"],
    ["seat", "n.", "座位；坐处(如椅子等)", "/ si:t/"],
    ["screen", "n.", "银幕；屏幕", "/ skri:n/"],
    ["close", "adj.", "(在空间、时间上)接近", "/kləʊs/"],
    ["ticket", "n.", "票；入场券", "/'tɪk.ɪt/"],
    ["worst(bad和badly的最高级)", "adj.& adv.", "最差(的); 最坏(的); 最糟(的)", "/wɜːst/"],
    ["cheaply", "adv.", "便宜地；低廉地", "/'tʃi:p. li/"],
    ["song", "n.", "歌；歌曲", "/sɒŋ/"],
    ["DJ", "n.", "(电台、电视台、俱乐部的)音乐节目主持人", "/' di:dʒeɪ/"],
    ["choose(chose)", "v.", "选择；挑选", "/tʃu:z/ (/tʃəʊz/)"],
    ["carefully", "adv.", "细致地；小心地；谨慎地", "/'keə.fəl. i/"],
    ["reporter", "n.", "记者", "/rɪ'pɔ:.tər/"],
    ["so far", "adv. phr.", "到目前为止;迄今为止", "/səʊ/ /fɑ:r/"],
    ["fresh", "adj.", "新鲜的；清新的", "/freʃ/"],
    ["comfortably", "adv.", "舒服地；舒适地", "/'kʌmf.tə. bli/"],
    ["worse(bad和badly的比较级)", "adj.& adv.", "更差(的); 更坏(的); 更糟(的)", "/wɜːs/"],
    ["service", "n.", "接待；服务", "/'sɜː. vɪs/"],
    ["pretty", "adv.", "相当十分; 很 adj.漂亮的", "/'prɪt. i/"],
    ["menu", "n.", "菜单", "/' men. ju:/"],
    ["role", "n.", "作用；职能；角色", "/rəʊl/"],
    ["act", "v.", "扮演 n.表演者", "/ækt/"],
    ["meal", "n.", "早(或午、晚)餐;一餐所吃的食物", "/mɪəl/"],
    ["creative", "adj.", "有创造力的；创造性的", "/ kri'eɪ. tɪv/"],
    ["performer", "n.", "表演者；演员", "/pə'fɔ:.mər/"],
    ["talent", "n.", "天资；天赋", "/'tæl.ənt/"],
    ["have... in common", "v. phr.", "有相同特征；(想法、兴趣等方面)相同", "/hæv/ /ɪn//'kɒm.ən/"],
    ["magician", "n.", "魔术师", "/mə'dʒɪʃ.ən/"],
    ["all kinds of", "adj. phr.", "各种类型的;各种各样的", "/ɔ:l//kaɪndz/ /əv/"],
    ["beautifully", "adv.", "美好地；漂亮地", "/' bju:. tɪ.fəl. i/"],
    ["be up to", "v. phr.", "是……的职责; 由……决定", "/ bi://ʌp// tu:/"],
    ["play a role", "v. phr.", "发挥作用;有影响", "/pleɪ/ /ə//rəʊl/"],
    ["winner", "n.", "获胜者；优胜者", "/'wɪn.ər/"],
    ["prize", "n.", "奖；奖品；奖金", "/praɪz/"],
    ["everybody", "pron.", "每人；人人；所有人", "/' ev. ri. bɒd. i/"],
    ["make up", "v. phr.", "编造(故事、谎言等)", "/meɪk//ʌp/"],
    ["example", "n.", "实例；范例", "/ɪg'zɑ:m.pəl/"],
    ["for example", "phr.", "例如", "/fɔ:r/ /ɪg'zɑ:m.pəl/"],
    ["poor", "adj.", "贫穷的；清贫的", "/pɔ:r/"],
    ["seriously", "adv.", "严重地；严肃地；认真地", "/'sɪə. ri.əs. li/"],
    ["take …… seriously", "v. phr.", "认真对待……", "/teɪk//'sɪə. ri.əs. li/"],
    ["give (gave)", "v.", "提供；给", "/gɪv/ (/geɪv/)"],
    ["crowded", "adj.", "人多的；拥挤的；挤满的", "/'kraʊ. dɪd/"],
  ],
  'g8a-u5': [
    ["sitcom (situation comedy)", "n.", "情景喜剧", "/'sɪt. kɒm/(1,sɪtʃ. u'eɪ.ʃən//'kɒm.ə. di/)"],
    ["news", "n.", "新闻节目；新闻", "/ nju:z/"],
    ["soap opera", "n. phr.", "肥皂剧", "/'səʊp ˌɒp.ər.ə/"],
    ["mind", "v.", "介意；对(某事)烦恼", "/maɪnd/"],
    ["stand (stood)", "v.", "忍受；站立", "/stænd/(/stʊd/)"],
    ["educational", "adj.", "教育的；有教育意义的", "/ˌedʒ.ʊ'keɪ.ʃən.əl/"],
    ["plan", "v.&n.", "打算; 计划", "/plæn/"],
    ["hope", "v.&n.", "希望", "/həʊp/"],
    ["find out", "v. phr.", "查明; 弄清", "/faɪnd/ /aʊt/"],
    ["discussion", "n.", "讨论；商量", "/dɪ'skʌʃ.ən/"],
    ["happen", "v.", "发生；出现", "/'hæp.ən/"],
    ["expect", "v.", "预料；期待", "/ɪk' spekt/"],
    ["joke", "n.", "笑话；玩笑", "/dʒəʊk/"],
    ["comedy", "n.", "喜剧；喜剧片", "/'kɒm.ə. di/"],
    ["meaningless", "adj.", "毫无意义的；意思不明确的", "/' mi:. nɪŋ.ləs/"],
    ["action", "n.", "行动", "/'æk.ʃən/"],
    ["action movie", "n. phr.", "动作影片", "/'æk.ʃən//' mu:. vi/"],
    ["cartoon", "n.", "动画片；卡通片", "/kɑː' tu:n/"],
    ["culture", "n.", "文化；文明", "/'kʌl. tʃər/"],
    ["famous", "adj.", "著名的；出名的", "/'feɪ.məs/"],
    ["appear", "v.", "出现", "/ə'pɪər/"],
    ["become(became)", "v.", "开始变得；变成", "/bɪ'kʌm/(/bɪ'keɪm/)"],
    ["rich", "adj.", "富有的", "/rɪtʃ/"],
    ["successful", "adj.", "获得成功的；有成就的", "/sək' ses.fəl/"],
    ["might", "v.", "可能；可以", "/maɪt/"],
    ["main", "adj.", "主要的；最重要的", "/meɪn/"],
    ["reason", "n.", "原因；理由", "/' ri:.zən/"],
    ["common", "adj.", "普通的；常见的", "/'kɒm.ən/"],
    ["film/ movie", "n.", "电影", "/fɪlm/ /' mu:. vi/"],
    ["unlucky", "adj.", "不幸的；不吉利的", "/ʌn'lʌk. i/"],
    ["lose (lost)", "v.", "失去；丢失", "/ lu:z/ /lɒst/"],
    ["girlfriend", "n.", "女朋友", "/'gɜːl. frend/"],
    ["ready", "adj.", "愿意的；准备好的", "/' red. i/"],
    ["be ready to", "v. phr.", "准备好/愿意(做某事)", "/ bi://' red. i// tu:/"],
    ["character", "n.", "人物；角色", "/'kær.ək.tər/"],
    ["simple", "adj.", "简单的；易做的", "/'sɪm.pəl/"],
    ["dress up", "v. phr.", "装扮; 乔装打扮", "/ dres/ /ʌp/"],
    ["take sb' s place", "v. phr.", "代替; 替换", "/teɪk/ /pleɪs/"],
    ["army", "n.", "陆军；陆军部队", "/'ɑː. mi/"],
    ["do a good job", "v. phr.", "干得好", "/ du:/  /ə//gʊd//dʒɒb/"],
  ],
  'g8a-u6': [
    ["grow up", "v. phr.", "长大; 成熟; 成长", "/grəʊ/ /ʌp/"],
    ["computerprogrammer", "n. phr.", "计算机程序设计员；编程人员", "/kəm' pju:.tər//'prəʊ.græm.ər/"],
    ["cook", "n.", "厨师 v.烹饪;煮", "/kʊk/"],
    ["doctor", "n.", "医生", "/'dɒk.tər/"],
    ["engineer", "n.", "工程师", "/ˌen. dʒɪ'nɪər/"],
    ["violinist", "n.", "小提琴手", "/ˌvaɪə'lɪn.ɪst/"],
    ["driver", "n.", "驾驶员；司机", "/'draɪ.vər/"],
    ["pilot", "n.", "飞行员", "/'paɪ.lət/"],
    ["pianist", "n.", "钢琴家", "/' pi:.ən.ɪst/"],
    ["scientist", "n.", "科学家", "/'saɪ.ən. tɪst/"],
    ["be sure about", "v. phr.", "确信; 对……有把握", "/ bi:/ /ʃɔ:r/ /ə'baʊt/"],
    ["make sure", "v. phr.", "确保; 查明", "/meɪk/ /ʃɔ:r/"],
    ["college", "n.", "学院；大学；高等专科学校", "/'kɒl.ɪdʒ/"],
    ["education", "n.", "教育", "/ˌedʒ.ʊ'keɪ.ʃən/"],
    ["medicine", "n.", "药；医学", "/' med. I.sən/"],
    ["university", "n.", "(综合性)大学；高等学府", "/, ju:. nɪ'vɜː.sə. ti/"],
    ["London", "n.", "伦敦", "/'lʌn.dən/"],
    ["article", "n.", "文章；论文", "/'ɑː. tɪ.kəl/"],
    ["send (sent)", "v.", "邮寄；发送", "/ send/ (/ sent/)"],
    ["resolution", "n.", "决心；决定", "/ˌrez.ə' lu:.ʃən/"],
    ["team", "n.", "队; 组", "/ ti:m/"],
    ["make the soccer team", "v. phr.", "成为足球队的一员", "/meɪk//ðə//'sɒk.ər/ / ti:m/"],
    ["foreign", "adj.", "外国的", "/'fɒr.ən/"],
    ["able", "adj.", "能够", "/'eɪ.bəl/"],
    ["be able to do", "v. phr.", "能够做某事", "/ bi:/ /'eɪ.bəl/ / tu:// du:/"],
    ["promise", "n.", "承诺；诺言 v.许诺；承诺", "/'prɒm.ɪs/"],
    ["beginning", "n.", "开头；开端", "/bɪ'gɪn.ɪŋ/"],
    ["at the beginning", "phr.", "在……开始 of", "/æt//ðə//bɪ'gɪn.ɪŋ//əv/"],
    ["improve", "v.", "改进；改善", "/ɪm' pru:v/"],
    ["write down", "v. phr.", "写下; 记录下", "/raɪt/ /daʊn/"],
    ["physical", "adj.", "身体的", "/'fɪz.ɪ.kəl/"],
    ["themselves", "pron.", "他(她、它)们自己", "/ðəm' selvz/"],
    ["have to do with", "v. phr.", "关于; 与……有联系", "/hæv/ / tu:/ / du://wɪð/"],
    ["self-improvement", "n.", "自我改进；自我提高", "/ˌself.ɪm' pru:v.mənt/"],
    ["take up", "v. phr.", "(尤指为消遣)学着做；开始做", "/teɪk/ /ʌp/"],
    ["hobby", "n.", "业余爱好", "/'hɒb. i/"],
    ["paint", "v.", "用颜料画；在……上刷油漆", "/peɪnt/"],
    ["weekly", "adj.& adv.", "每周的(地)", "/' wi:. kli/"],
    ["schoolwork", "n.", "学校作业；功课", "/' sku:l. wɜːk/"],
    ["question", "v.", "表示疑问；怀疑；提问；质询", "/' kwes. tʃən/"],
    ["meaning", "n.", "意义；意思", "/' mi:. nɪŋ/"],
    ["discuss", "v.", "讨论；商量", "/dɪ'skʌs/"],
    ["own", "adj.& pron.", "自己的; 本人的", "/əʊn/"],
    ["personal", "adj.", "个人的；私人的", "/'pɜː.sən.əl/"],
    ["relationship", "n.", "关系；联系", "/rɪ'leɪ.ʃən.ʃɪp/"],
  ],
  'g8a-u7': [
    ["paper", "n.", "纸；纸张", "/'peɪ.pər/"],
    ["pollution", "n.", "污染；污染物", "/pə' lu:.ʃən/"],
    ["prediction", "n.", "预言；预测", "/prɪ'dɪk.ʃən/"],
    ["future", "n.", "将来；未来", "/' fju:. tʃər/"],
    ["pollute", "v.", "污染", "/pə' lu:t/"],
    ["environment", "n.", "环境", "/ɪn'vaɪ.rə.mənt/"],
    ["planet", "n.", "行星", "/'plæn.ɪt/"],
    ["earth", "n.", "地球；世界", "/ɜːθ/"],
    ["plant", "v.", "种植 n.植物", "/plɑːnt/"],
    ["part", "n.", "部分", "/pɑːt/"],
    ["play a part", "v. phr.", "参与; 发挥作用", "/pleɪ/ /ə//pɑːt/"],
    ["peace", "n.", "和平", "/ pi:s/"],
    ["sea", "n.", "海；海洋", "/ si:/"],
    ["build (built)", "v.", "建筑；建造", "/bɪld//bɪlt/"],
    ["sky", "n.", "天空", "/skaɪ/"],
    ["astronaut", "n.", "宇航员；航天员", "/'æs.trə.nɔ:t/"],
    ["apartment", "n.", "公寓套房", "/ə' pa:t.mənt/"],
    ["rocket", "n.", "火箭", "/'rɒk.ɪt/"],
    ["space", "n.", "太空；空间", "/speɪs/"],
    ["space station", "n. phr.", "空间站；宇宙空间站", "/speɪs//'steɪ.ʃən/"],
    ["human", "adj.", "人的 n.人", "/' hju:.mən/"],
    ["servant", "n.", "仆人", "/'sɜː.vənt/"],
    ["dangerous", "adj.", "有危险的；不安全的", "/'deɪn. dʒər.əs/"],
    ["already", "adv.", "已经; 早已", "/ɔ:l' red. i/"],
    ["factory", "n.", "工厂", "/'fæk.tər. i/"],
    ["overandover again", "adv. phr.", "多次; 反复地", "/'əʊ.vər//ənd//'əʊ.vər/ /ə' gen/"],
    ["Japan", "n.", "日本", "/dʒəˈpæn/"],
    ["believe", "v.", "相信；认为有可能", "/bɪ' li:v/"],
    ["disagree", "v.", "不同意；持不同意见；有分歧", "/ˌdɪs.ə' gri:/"],
    ["even", "adv.", "甚至; 连; 愈加", "/'i:.vən/"],
    ["agree", "v.", "同意；赞成；应允", "/ə' gri:/"],
    ["hundreds of", "adj. phr.", "许多; 大量", "/'hʌn.drədz/ /əv/"],
    ["shape", "n.", "形状；外形", "/ʃeɪp/"],
    ["fall", "v.&n.", "倒塌; 跌倒; 掉落n.(美式)秋天", "/fɔ:l/"],
    ["fall down", "v. phr.", "突然倒下;跌倒;倒塌", "/fɔ:l//daʊn/"],
    ["inside", "adv.& prep.", "在......里面", "/ɪn'saɪd/"],
    ["look for", "v. phr.", "寻找; 寻求", "/lʊk/ /fɔ:r/"],
    ["possible", "adj.", "可能存在或发生的；可能的", "/'pɒs.ə.bəl/"],
    ["impossible", "adj.", "不可能(存在或发生)的", "/ɪm'pɒs.ə.bəl/"],
    ["side", "n.", "一方(的意见、态度、立场)", "/saɪd/"],
    ["probably", "adv.", "很可能；大概", "/'prɒb.ə. bli/"],
    ["during", "prep.", "在……期间", "/'dʒʊə. rɪŋ/"],
    ["holiday", "n.", "假期；假日", "/'hɒl.ə. deɪ/"],
    ["word", "n.", "单词；词", "/wɜ:d/"],
  ],
  'g8a-u8': [
    ["shake(shook)", "n.&v.", "摇动; 抖动", "/ʃeɪk/ (/ʃʊk/)"],
    ["milk shake", "n. phr.", "奶昔", "/mɪlk//ʃeɪk/"],
    ["blender", "n.", "食物搅拌器", "/' blen.dər/"],
    ["turn on", "v. phr.", "接通(电源、煤气、水等);打开", "/tɜːn/ /ɒn/"],
    ["peel", "v.", "剥皮；去皮", "/ pi:l/"],
    ["pour", "v.", "倒出；倾倒", "/pɔ:r/"],
    ["yogurt/ youghurt", "n.", "酸奶", "/'jɒg.ət/"],
    ["honey", "n.", "蜂蜜", "/'hʌn. i/"],
    ["watermelon", "n.", "西瓜", "/'wɔ:.təˌmel.ən/"],
    ["spoon", "n.", "勺；调羹", "/ spu:n/"],
    ["pot", "n.", "锅", "/pɒt/"],
    ["add", "v.", "增加；添加", "/æd/"],
    ["finally", "adv.", "最后; 最终", "/'faɪ.nəl. i/"],
    ["salt", "n.", "食盐", "/sɒlt/"],
    ["sugar", "n.", "食糖", "/'ʃʊg.ər/"],
    ["cheese", "n.", "干酪；奶酪", "/tʃi:z/"],
    ["popcorn", "n.", "爆米花", "/'pɒp.kɔ:n/"],
    ["corn", "n.", "玉米；谷物", "/kɔ:n/"],
    ["machine", "n.", "机器；器械装置", "/mə'ʃi:n/"],
    ["dig (dug)", "v.", "掘(地);凿(洞);挖(土)", "/dɪg/ (/dʌg/)"],
    ["hole", "n.", "洞; 孔; 坑", "/həʊl/"],
    ["sandwich", "n.", "夹心面包片；三明治", "/'sæn. wɪdʒ/"],
    ["butter", "n.", "黄油；奶油", "/'bʌt.ər/"],
    ["turkey", "n.", "火鸡；火鸡肉", "/'tɜ:. ki/"],
    ["lettuce", "n.", "莴苣(wōjù); 生菜", "/' let.ɪs/"],
    ["piece", "n.", "片; 块; 段", "/ pi:s/"],
    ["Thanksgiving", "n.", "感恩节", "/ˌθæŋks'gɪv.ɪŋ/"],
    ["traditional", "adj.", "传统的；惯例的", "/trə'dɪʃ.ən.əl/"],
    ["autumn", "n.", "秋天；秋季", "/'ɔ:.təm/"],
    ["celebrate", "v.", "庆祝；庆贺", "/' sel.ə. breɪt/"],
    ["prepare", "v.", "使做好准备；把……准备好", "/prɪ'peər/"],
    ["gravy", "n.", "(调味)肉汁", "/'greɪ. vi/"],
    ["mashed", "adj.", "捣烂的", "/mæʃt/"],
    ["pumpkin", "n.", "南瓜", "/'pʌmp. kɪn/"],
    ["pie", "n.", "果馅饼；果馅派", "/paɪ/"],
    ["mix", "n.", "混合配料 v.(使)混合；融合", "/mɪks/"],
    ["pepper", "n.", "胡椒粉；柿子椒", "/' pep.ər/"],
    ["fill", "v.", "(使)充满；装满", "/fɪl/"],
    ["oven", "n.", "烤箱；烤炉", "/'ʌv.ən/"],
    ["plate", "n.", "盘子；碟子", "/pleɪt/"],
    ["cover", "v.", "遮盖；覆盖 n.覆盖物；盖子", "/'kʌv.ər/"],
    ["serve", "v.", "接待；服务；提供", "/sɜːvl"],
    ["temperature", "n.", "温度；气温；体温", "/' tem.prə. tʃər/"],
  ],
  'g8a-u9': [
    ["prepare for", "v. phr.", "为……做准备", "/prɪ'peər/ /fɔ:r/"],
    ["exam(examination)", "n.", "考试", "/ɪg'zæm//ɪg,zæm.ɪ'neɪ.ʃən/"],
    ["go to the/a doctor", "v. phr.", "去看医生", "/gəʊ/ / tu:/ /ðə/ /ə//'dɒk.tər/"],
    ["flu", "n.", "流行性感冒；流感", "/ flu:/"],
    ["available", "adj.", "有空的；可获得的", "/ə'veɪ.lə.bəl/"],
    ["another time", "adv. phr.", "其他时间; 别的时间", "/ə'nʌð.ər/ /taɪm/"],
    ["until", "conj.& prep.", "到……时; 直到…为止", "/ən'tɪl/"],
    ["hang(hung)", "v.", "悬挂；垂下", "/hæŋ/ (/hʌŋ/)"],
    ["hang out", "v. phr.", "闲逛; 常去某处", "/hæŋ/ /aʊt/"],
    ["catch (caught)", "v.", "及时赶上；接住；抓住", "/kætʃ/ /kɔ:t/"],
    ["invite", "v.", "邀请", "/ɪn'vaɪt/"],
    ["accept", "v.", "接受", "/ək' sept/"],
    ["refuse", "v.", "拒绝", "/rɪ' fju:z/"],
    ["thedaybefore yesterday", "adv. phr.", "前天", "/ðə/ /deɪ/ /bɪ'fɔ:r//' jes.tə. deɪ/"],
    ["thedayafter tomorrow", "adv. phr.", "后天", "/ðə/ /deɪ/ /'ɑːf.tər//tə'mɒr.əʊ/"],
    ["weekday", "n.", "工作日(周一至周五的任何一天)", "/' wi:k. deɪ/"],
    ["look after", "v. phr.", "照料; 照顾", "/lʊk//'ɑ:f.tər/"],
    ["invitation", "n.", "邀请；请柬", "/ˌɪn. vɪ'teɪ.ʃən/"],
    ["turn down", "v. phr.", "拒绝", "/tɜːn/ /daʊn/"],
    ["reply", "v.", "回答；回复", "/rɪ'plaɪ/"],
    ["forward", "v.", "转寄;发送 adv.向前;前进", "/'fɔ:.wəd/"],
    ["delete", "v.", "删除", "/dɪ' li:t/"],
    ["print", "v.", "打印；印刷", "/prɪnt/"],
    ["sad", "adj.", "(令人)悲哀的；(令人)难过的", "/sæd/"],
    ["goodbye", "", "Interj.&n.再见", "/gʊd'baɪ/"],
    ["take a trip", "v. phr.", "去旅行", "/teɪk//ə//trɪp/"],
    ["glad", "adj.", "高兴; 愿意", "/glæd/"],
    ["help out", "v. phr.", "(帮助……)分担工作、解决难题", "/ help//aʊt/"],
    ["preparation", "n.", "准备；准备工作", "/ˌprep.ər'eɪ.ʃən/"],
    ["glue", "n.", "胶水", "/ glu:/"],
    ["without", "prep.", "没有; 不(做某事)", "/wɪ'ðaʊt/"],
    ["surprised", "adj.", "惊奇的；感觉意外的", "/sə'praɪzd/"],
    ["look forward to", "v. phr.", "盼望; 期待", "/lʊk//'fɔ:.wəd// tu:/"],
    ["hear from", "v.phr.", "接到(某人的)信、电话等", "/hɪər/ /frɒm/"],
    ["housewarming", "n.", "乔迁聚会", "/'haʊs.wɔ:. mɪŋ/"],
    ["opening", "n.", "开幕式；落成典礼", "/'əʊ.pən.ɪŋ/"],
    ["concert", "n.", "音乐会；演奏会", "/'kɒn.sət/"],
    ["headmaster", "n.", "校长", "/ˌhed' ma:.stər/"],
    ["event", "n.", "大事；公开活动；比赛项目", "/ɪ' vent/"],
    ["guest", "n.", "客人；宾客", "/ gest/"],
    ["calendar", "n.", "日；日程表", "/'kæl.ən.dər/"],
    ["daytime", "n.", "白天；日间", "/'deɪ. taɪm/"],
  ],
  'g8a-u10': [
    ["meeting", "n.", "会议；集会；会面", "/' mi:. tɪŋ/"],
    ["video", "n.", "录像带；录像", "/'vɪd. i.əʊ/"],
    ["organize/organise", "v.", "组织；筹备", "/'ɔ:.gən. aɪz/"],
    ["potato chips", "n. phr.", "炸土豆片;炸薯条", "/pə'teɪ. təʊ/ /tʃɪps/"],
    ["chocolate", "n.", "巧克力", "/'tʃɒk.lət/"],
    ["upset", "adj.", "难过；失望；沮丧", "/ʌp' set/"],
    ["taxi", "n.", "出租汽车；的士", "/'tæk. si/"],
    ["advice", "n.", "劝告；建议", "/əd'vaɪs/"],
    ["travel", "v.&n.", "旅行; 游历", "/'træv.əl/"],
    ["agent", "n.", "代理人；经纪人", "/'eɪ. dʒənt/"],
    ["expert", "n.", "专家", "/' ek. spɜːt/"],
    ["keep ... to oneself", "v. phr.", "保守秘密", "/ ki:p// tu://ˌwʌn' self/"],
    ["teenager", "n.", "(13~19岁的)青少年", "/' ti:nˌeɪ. dʒər/"],
    ["normal", "adj.", "正常的；一般的", "/'nɔ:.məl/"],
    ["unless", "conj.", "除非; 如果不", "/ən' les/"],
    ["certainly", "adv.", "无疑；肯定；当然；行", "/'sɜː.tən. li/"],
    ["wallet", "n.", "钱包", "/'wɒl.ɪt/"],
    ["mile", "n.", "英里", "/maɪl/"],
    ["angry", "adj.", "发怒的；生气的", "/'æŋ. gri/"],
    ["understanding", "n.", "善解人意的；体谅人的", "/,ʌn.də'stæn. dɪŋ/"],
    ["careless", "adj.", "粗心的；不小心的", "/'keə.ləs/"],
    ["mistake", "n.", "错误；失误", "/mɪ'steɪk/"],
    ["himself", "pron.", "他自己", "/hɪm' self/"],
    ["careful", "adj.", "小心的；细致的；精心/慎重的", "/'keə.fəl/"],
    ["advise", "v.", "劝告；建议", "/əd'vaɪz/"],
    ["solve", "v.", "解决；解答", "/sɒlv/"],
    ["step", "n.", "步；步骤", "/ step/"],
    ["trust", "v.", "相信；信任", "/trʌst/"],
    ["experience", "n.", "经验；经历", "/ɪk'spɪə. ri.əns/"],
    ["in half", "adv.", "分成两半", "/ɪn/ /hɑ:f/"],
    ["halfway", "adj.&adv.", "在中途；部分地做或达到", "/, ha:f'weɪ/"],
    ["else", "adv.", "别的；其他的", "/ els/"],
  ],
};

const GRADE_G8B_UNIT_TITLES = ["Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7","Unit 8","Unit 9","Unit 10"];

const RAW_WORDS_G8B = {
  'g8b-u1': [
    ["matter", "n.", "问题；事情", "/'mæt.ər/"],
    ["What' sthe matter?", "", "怎么了?出什么事了?", "/wɒts//ðə//'mæt.ər/"],
    ["sore", "adj.", "疼痛的；酸痛的", "/sɔ:r/"],
    ["have a cold", "v. phr.", "感冒", "/hæv/ /ə//kəʊld/"],
    ["stomachache", "n.", "胃痛；腹痛", "/'stʌm.ək. eɪk/"],
    ["have astomachache", "v. phr.", "胃痛", "/hæv//ə//'stʌm.ək. eɪk/"],
    ["foot", "n.", "脚; 足", "/fʊt/"],
    ["neck", "n.", "颈；脖子", "/ nek/"],
    ["stomach", "n.", "胃；腹部", "/'stʌm.ək/"],
    ["throat", "n.", "咽喉；喉咙", "/θrəʊt/"],
    ["fever", "n.", "发烧", "/' fi:.vər/"],
    ["lie (lay)", "v.", "躺；平躺", "/laɪ/ (/leɪ/)"],
    ["lie down", "v. phr.", "躺下", "/laɪ/ /daʊn/"],
    ["rest", "v.&n.", "放松; 休息", "/ rest/"],
    ["cough", "n.&v.", "咳嗽", "/kɒf/"],
    ["X-ray", "n.", "X射线; X光", "/' eks. reɪ/"],
    ["toothache", "n.", "牙痛", "/' tu:θ. eɪk/"],
    ["takeone' s temperature", "v. phr.", "量体温", "/teɪk//wʌns//' tem.prə. tʃər/"],
    ["headache", "n.", "头痛", "/' hed. eɪk/"],
    ["have a fever", "v. phr.", "发烧", "/hæv//ə//' fi:.vər/"],
    ["break", "n.", "间歇；休息", "/breɪk/"],
    ["take breaks(take a break)", "v. phr.", "休息", "/teɪk//breIks/(/teɪk/ /ə/ /breɪk/)"],
    ["hurt (hurt)", "v.", "(使)疼痛；受伤", "/hɜːt/"],
    ["passenger", "n.", "乘客；旅客", "/'pæs.ən. dʒər/"],
    ["off", "adv.& prep.", "离开(某处); 不工作;从……去掉", "/ɒf/"],
    ["get off", "v. phr.", "下车", "/ get/ /ɒf/"],
    ["to one' s surprise", "adv.", "使…惊讶的是；出乎……的意料", "/ tu://wʌns//sə'praɪz/"],
    ["onto", "prep.", "向; 朝", "/'ɒn. tu/"],
    ["trouble", "n.", "问题；苦恼", "/'trʌb.əl/"],
    ["hit (hit)", "v.", "(用手或器具)击；打", "/hɪt/"],
    ["right away", "adv. phr.", "立即; 马上", "/raɪt/ /ə'weɪ/"],
    ["get into", "v. phr.", "陷入; 参与", "/ get//'ɪn. tu:/"],
    ["herself (she的反身代词)", "pron.", "她自己", "/hɜː' self/"],
    ["bandage", "n.", "绷带 v.用绷带包扎", "/'bæn. dɪdʒ/"],
    ["press", "v.", "压; 挤; 按", "/ pres/"],
    ["sick", "adj.", "生病的；有病的", "/sɪk/"],
    ["knee", "n.", "膝；膝盖", "/ ni:/"],
    ["nosebleed", "n.", "鼻出血", "/'nəʊz. bli:d/"],
    ["breathe", "v.", "呼吸", "/ bri:ð/"],
    ["sunburned", "adj.", "晒伤的", "/'sʌn.b3: nd/"],
    ["ourselves (we 的反身代词)", "pron.", "我们自己", "/ˌaʊə' selvz/"],
    ["climber", "n.", "登山者；攀登者", "/'klaɪ.mər/"],
    ["be used to", "v. phr.", "习惯于……; 适应于……", "/ bi:// ju: st// tu:/"],
    ["risk", "n.&v.", "危险; 风险; 冒险", "/rɪsk/"],
    ["take risks(take a risk)", "v. phr.", "冒险", "/teɪk//rɪsks/(/teɪk/ /ə/ )"],
    ["accident", "n.", "(交通)事故；意外遭遇", "/'æk. sɪ.dənt/"],
    ["situation", "n.", "情况；状况", "/ˌsɪtʃ. u'eɪ.ʃən/"],
    ["kilo / kilogram", "n.", "千克；公斤", "/' ki:. ləʊ//'kɪl.ə.græm/"],
    ["rock", "n.", "岩石", "/rɒk/"],
    ["run out(of)", "v. phr.", "用尽; 耗尽", "/rʌn/ /aʊt/ /əv/"],
    ["knife pl. knives", "n.", "刀", "/naɪf//naɪvz/"],
    ["cut off", "v. phr.", "切除", "/kʌt/ /ɒf/"],
    ["blood", "n.", "血", "/blʌd/"],
    ["mean(meant)", "v.", "意思是；打算；意欲", "/ mi:n/ / ment/"],
    ["get out of", "v. phr.", "离开; 从……出来", "/ get/ /aʊt/ /əv/"],
    ["importance", "n.", "重要性；重要", "/ɪm'pɔ:.təns/"],
    ["decision", "n.", "决定；抉择", "/dɪ'sɪʒ.ən/"],
    ["control", "n.&v.", "限制; 约束; 管理", "/kən'trəʊl/"],
    ["be in control of", "v. phr.", "掌管; 管理", "/ bi://ɪn//kən'trəʊl/ /əv/"],
    ["spirit", "n.", "勇气；意志", "/'spɪr.ɪt/"],
    ["death", "n.", "死；死亡", "/deθ/"],
    ["give up", "v. phr.", "放弃", "/gɪv/ /ʌp/"],
    ["nurse", "n.", "护士", "/nɜːs/"],
  ],
  'g8b-u2': [
    ["clean up", "v. phr.", "打扫(或清除)干净", "/ kli:n/ /ʌp/"],
    ["cheer", "v.", "欢呼；喝彩", "/tʃɪər/"],
    ["cheer up", "v. phr.", "(使)变得更高兴;(使)振奋起来", "/tʃɪər/ /ʌp/"],
    ["give out", "v. phr.", "分发; 散发", "/gɪv/ /aʊt/"],
    ["volunteer", "v.", "义务做；自愿做 n.志愿者", "/,vɒl.ən'tɪər/"],
    ["come up with", "v. phr.", "想出; 提出", "/kʌm//ʌp//wɪð/"],
    ["put off", "v. phr.", "推迟", "/pʊt/ /ɒf/"],
    ["sign", "n.", "标志；信号", "/saɪn/"],
    ["notice", "n.", "通知；通告；注意v.注意到；意识到", "/'nəʊ. tɪs/"],
    ["hand out", "v. phr.", "分发", "/hænd/ /aʊt/"],
    ["call up", "v.phr.", "打电话给(某人); 征召", "/kɔ:l/ /ʌp/"],
    ["used to", "v. phr.", "曾经……; 过去……", "/ ju: st/ / tu:/"],
    ["lonely", "adj.", "孤独的；寂寞的", "/'ləʊn. li/"],
    ["care for", "v. phr.", "照顾; 非常喜欢", "/keər//fɔ:r/"],
    ["several", "adj.", "几个；数个；一些", "/' sev.ər.əl/"],
    ["strong", "adj.", "强烈的；强壮的", "/strɒŋ/"],
    ["feeling", "n.", "感觉；感触", "/' fi:. lɪŋ/"],
    ["satisfaction", "n.", "满足；满意", "/ˌsæt.ɪs'fæk.ʃən/"],
    ["joy", "n.", "高兴；愉快", "/dʒɔɪ/"],
    ["owner", "n.", "物主；主人", "/'əʊ.nər/"],
    ["try out", "v. phr.", "参加……选拔; 试用", "/traɪ/ /aʊt/"],
    ["journey", "n.", "(尤指长途)旅行；行程", "/'dʒɜː. ni/"],
    ["raise", "v.", "募集；征集", "/reɪz/"],
    ["midnight", "n.", "午夜；子夜", "/'mɪd. naɪt/"],
    ["alone", "adv.", "独自; 单独", "/ə'ləʊn/"],
    ["repair", "v.", "修理；修补", "/rɪ'peər/"],
    ["fix", "v.", "修理；安装", "/fɪks/"],
    ["fix up", "v. phr.", "修理; 装饰", "/fɪks//ʌp/"],
    ["give away", "v. phr.", "赠送; 捐赠", "/gɪv/ /ə'weɪ/"],
    ["take after", "v. phr.", "(外貌或行为)像", "/teɪk//'ɑ:f.tər/"],
    ["broken", "adj.", "破损的；残缺的", "/'brəʊ.kən/"],
    ["wheel", "n.", "车轮；轮子", "/ wi:l/"],
    ["letter", "n.", "信; 函", "/'letə(r)/"],
    ["Miss", "n.", "女士；小姐", "/mɪs/"],
    ["set up", "v. phr.", "建起; 设立", "/ set/ /ʌp/"],
    ["disabled", "adj.", "丧失能力的；有残疾的", "/dɪ'seɪ.bəld/"],
    ["make a difference", "v. phr.", "影响; 有作用", "/meɪk/ /ə//'dɪf.ər.əns/"],
    ["blind", "adj.", "瞎的；失明的", "/blaInd/"],
    ["deaf", "adj.", "聋的", "/ def/"],
    ["imagine", "v.", "想象；设想", "/ɪ'mædʒ.ɪn/"],
    ["difficulty", "n.", "困难；难题", "/'dɪf.ɪ.kəl. ti/"],
    ["open", "v.", "开；打开", "/'əʊ.pən/"],
    ["door", "n.", "门", "/dɔ:r/"],
    ["carry", "v.", "拿; 提; 扛", "/'kær. i/"],
    ["train", "v.", "训练；培训", "/treɪn/"],
    ["excited", "adj.", "激动的；兴奋的", "/ɪk'saɪ. tɪd/"],
    ["training", "n.", "训练；培训", "/'treɪ. nɪŋ/"],
    ["kindness", "n.", "仁慈；善良", "/'kaɪnd.nəs/"],
    ["clever", "adj.", "聪明的；聪颖的", "/' klev.ər/"],
    ["understand(understood)", "v.", "理解；领会", "/ˌʌn.də'stænd//,ʌn.də'stʊd/"],
    ["change", "v.&n.", "变化; 改变", "/tʃeɪndʒ/"],
    ["interest", "n.", "兴趣；关注 v.使感兴趣；使关注", "/'ɪn. trest/"],
    ["sir", "n.", "先生(用于正式信函中对不知名的男性收信人的称呼时，写为 Sir)", "/sɜːr/"],
    ["madam", "n.", "夫人；女士(用于正式信函中对不知名的女性收信人的称呼时，写为Madam)", "/'mæd.əm/"],
  ],
  'g8b-u3': [
    ["rubbish", "n.", "垃圾；废弃物", "/'rʌb.ɪʃ/"],
    ["take out the rubbish", "v. phr.", "倒垃圾", "/teɪk/ /aʊt/ /ðə//'rʌb.ɪʃ/"],
    ["fold", "v.", "折叠；对折", "/fəʊld/"],
    ["sweep", "v.", "扫；打扫", "/ swi:p// swept/"],
    ["floor", "n.", "地板", "/flɔ:r/"],
    ["mess", "n.", "杂乱；不整洁", "/ mes/"],
    ["throw (threw)", "v.", "扔; 掷", "/θrəʊ/ /θru:/"],
    ["all the time", "adv.", "频繁; 反复", "/ɔ:l//ðə/ /taɪm/"],
    ["neither", "adv.", "也不 pron.两者都不", "/'naɪ.ðər/"],
    ["shirt", "n.", "衬衫", "/ʃɜːt/"],
    ["as soon as", "conj. phr.", "一……就……", "/æz/ / su:n/ /æz/"],
    ["pass", "v.", "给；递；走过；通过", "/pɑ:s/"],
    ["tool", "n.", "工具", "/ tu:l/"],
    ["borrow", "v.", "借；借用", "/'bɒr.əʊ/"],
    ["lend (lent)", "v.", "借给；借出", "/ lend/ / lent/"],
    ["finger", "n.", "手指", "/'fɪŋ.gər/"],
    ["hate", "v.", "厌恶；讨厌", "/heɪt/"],
    ["chore", "n.", "杂务；乏味无聊的工作", "/tʃɔ:r/"],
    ["while", "conj.", "与……同时; 当……的时候;而；然而", "/waɪl/"],
    ["snack", "n.", "点心；小吃；快餐", "/snæk/"],
    ["stress", "n.", "精神压力；心理负担", "/ stres/"],
    ["waste", "n.", "浪费；垃圾 v.浪费；滥用", "/weɪst/"],
    ["in order to", "", "目的是；为了", "/ɪn//'ɔ:.dər// tu:/"],
    ["provide", "v.", "提供；供应", "/prə'vaɪd/"],
    ["anyway", "adv.", "而且; 加之", "/' en. i. weɪ/"],
    ["depend", "v.", "依靠；信赖", "/dɪ' pend/"],
    ["depend on", "v. phr.", "依靠; 信赖", "/dɪ' pend/ /ɒn/"],
    ["develop", "v.", "发展；壮大", "/dɪ' vel.əp/"],
    ["independence", "n.", "独立", "/ˌɪn. dɪ' pen.dəns/"],
    ["fairness", "n.", "公正性；合理性", "/'feə.nəs/"],
    ["since", "conj.", "因为; 既然prep., conj.& adv.从......以后;自……以来", "/sɪns/"],
    ["neighbor", "n.", "邻居", "/'neɪ.bər/"],
    ["take care of", "v. phr.", "照顾; 处理", "/teɪk//keər/ /əv/"],
    ["ill", "adj.", "有病；不舒服", "/ɪl/"],
    ["drop", "v.", "落下；掉下", "/drɒp/"],
    ["independent", "adj.", "独立的；自主的", "/ˌɪn. dɪ' pen.dənt/"],
    ["fair", "adj.", "合理的；公正的", "/feər/"],
    ["unfair", "adj.", "不合理的；不公正的", "/ʌn'feərl"],
  ],
  'g8b-u4': [
    ["allow", "v.", "允许；准许", "/ə'laʊ/"],
    ["wrong", "adj.", "有毛病；错误的", "/rɒŋ/"],
    ["What' s wrong?", "", "哪儿不舒服?", "/wɒts//rɒŋ/"],
    ["look through", "v. phr.", "快速查看; 浏览", "/lʊk/ /θru:/"],
    ["guess", "v.", "猜测；估计", "/ ges/"],
    ["deal", "v.", "协议；交易", "/ di:l/"],
    ["big deal", "v. phr.", "重要的事", "/bɪg/ / di:l/"],
    ["work out", "v. phr.", "成功地发展;解决", "/wɜːk//aʊt/"],
    ["get on with", "v. phr.", "和睦相处；关系良好", "/ get/ /ɒn//wɪð/"],
    ["relation", "n.", "关系；联系；交往", "/rɪ'leɪ.ʃən/"],
    ["communication", "n.", "交流；沟通", "/kə, mju:. nɪ'keɪ.ʃən/"],
    ["argue", "v.", "争吵；争论", "/'ɑːg. ju:/"],
    ["cloud", "n.", "云；云朵", "/klaʊd/"],
    ["elder", "adj.", "年纪较长的", "/' el.dər/"],
    ["instead", "adv.", "代替; 反而; 却", "/ɪn' sted/"],
    ["whatever", "pron.", "任何; 每一", "/wɒt' ev.ər/"],
    ["nervous", "adj.", "焦虑的；担忧的", "/'nɜː.vəs/"],
    ["offer", "v.", "主动提出；自愿给予", "/'ɒf.ər/"],
    ["proper", "adj.", "正确的；恰当的", "/'prɒp.ər/"],
    ["secondly", "adv.", "第二; 其次", "/' sek.ənd. li/"],
    ["communicate", "v.", "交流；沟通", "/kə' mju:. nɪ. keɪt/"],
    ["explain", "v.", "解释；说明", "/ɪk'spleɪn/"],
    ["clear", "adj.", "清楚易懂的；晴朗的", "/klɪər/"],
    ["copy", "v.", "抄袭；模仿；复制；复印", "/'kɒp. i/"],
    ["return", "v.", "归还；回来；返回", "/rɪ'tɜːn/"],
    ["anymore", "adv.", "(常用于否定句和疑问句末)再也(不);(不)再", "/, en. i'mɔ:r/"],
    ["member", "n.", "成员；分子", "/' mem.bər/"],
    ["pressure", "n.", "压力", "/'preʃ.ər/"],
    ["compete", "v.", "竞争；对抗", "/kəm' pi:t/"],
    ["opinion", "n.", "意见；想法；看法", "/ə'pɪn.jən/"],
    ["push", "v.", "鞭策；督促；推动", "/pʊʃ/"],
    ["skill", "n.", "技艺；技巧", "/skɪl/"],
    ["typical", "adj.", "典型的", "/'tɪp.ɪ.kəl/"],
    ["football", "n.", "(美式)橄榄球；足球", "/'fʊt.bɔ:l/"],
    ["cut out", "v. phr.", "删除; 删去", "/kʌt/ /aʊt/"],
    ["quick", "adj.", "快的；迅速的；时间短暂的", "/kwɪk/"],
    ["continue", "v.", "持续；继续存在", "/kən'tɪn. ju:/"],
    ["compare", "v.", "比较", "/kəm'peər/"],
    ["compare ... with", "v. phr.", "比较; 对比", "/kəm'peər/ /wɪð/"],
    ["crazy", "adj.", "不理智的；疯狂的", "/'kreɪ. zi/"],
    ["development", "n.", "发展；发育；成长", "/dɪ' vel.əp.mənt/"],
    ["cause", "v.", "造成；引起", "/kɔ:z/"],
    ["usual", "adj.", "通常的；寻常的", "/' ju:.ʒu.əl/"],
    ["in one's opinion", "", "依……看", "/ɪn//wʌnz//ə'pɪn.jən/"],
    ["perhaps", "adv.", "可能；大概；也许", "/pə'hæps/"],
  ],
  'g8b-u5': [
    ["rainstorm", "n.", "暴风雨", "/'reɪn.stɔ:m/"],
    ["alarm", "n.", "闹钟", "/ə'lɑːm/"],
    ["go off", "v. phr.", "(闹钟)发出响声", "/gəʊ/ /ɒf/"],
    ["begin(began)", "v.", "开始", "/bɪ'gɪn/(/bɪ'gæn/)"],
    ["heavily", "adv.", "在很大程度上；大量地", "/' hev.əl. i/"],
    ["suddenly", "adv.", "突然; 忽然", "/'sʌd.ən. li/"],
    ["pick up (pick up the phone)", "v.phr.", "接电话", "/pɪk//ʌp//ðə//fəʊn/"],
    ["strange", "adj.", "奇特的；奇怪的", "/streɪndʒ/"],
    ["storm", "n.", "暴风雨", "/stɔ:m/"],
    ["wind", "n.", "风", "/wɪnd/"],
    ["light", "n.", "光；光线；光亮", "/laɪt/"],
    ["report", "v.&n.", "报道; 公布", "/rɪ'pɔ:t/"],
    ["area", "n.", "地域；地区", "/'eə. ri.ə/"],
    ["wood", "n.", "木；木头", "/wʊd/"],
    ["window", "n.", "窗；窗户", "/'wɪn. dəʊ/"],
    ["flashlight", "n.", "手电筒", "/'flæʃ. laɪt/"],
    ["match", "n.", "火柴", "/mætʃ/"],
    ["beat (beat)", "v.", "敲打；打败", "/ bi:t/"],
    ["against", "prep.", "倚; 碰; 撞", "/ə' genst/"],
    ["at first", "adv. phr.", "起初; 起先", "/æt//'fɜːst/"],
    ["asleep", "adj.", "睡着", "/ə' sli:p/"],
    ["fall asleep", "v. phr.", "进入梦乡; 睡着", "/fɔ:l/ /ə' sli:p/"],
    ["die down", "v. phr.", "逐渐变弱；逐渐消失", "/daɪ/ /daʊn/"],
    ["rise (rose)", "v.", "升起；增加；提高", "/raɪz/ (/rəʊz/)"],
    ["fallen", "adj.", "倒下的；落下的", "/'fɔ:.lən/"],
    ["apart", "adv.", "分离; 分开", "/ə'pɑːt/"],
    ["towards", "prep.", "朝; 向; 对着", "/tə'wɔ: dz/"],
    ["have a look", "v. phr.", "看一看", "/hæv/ /ə/ /lʊk/"],
    ["icy", "adj.", "覆盖着冰的；冰冷的", "/'aɪ. si/"],
    ["kid", "n.", "开玩笑；欺骗", "/kɪd/"],
    ["realize", "v.", "理解；领会；认识到", "/'rɪə. laɪz/"],
    ["make one's way", "v. phr.", "前往;费力地前进", "/meɪk//wʌnz//weɪ/"],
    ["passage", "n.", "章节；段落", "/'pæs.ɪdʒ/"],
    ["pupil", "n.", "学生", "/' pju:.pəl/"],
    ["completely", "adv.", "彻底地；完全地", "/kəm' pli:t. li/"],
    ["shocked", "adj.", "惊愕的；受震惊的", "/ʃɒkt/"],
    ["silence", "n.", "沉默；缄默；无声", "/'saɪ.ləns/"],
    ["in silence", "", "沉默；无声", "/ɪn//'saɪ.ləns/"],
    ["recently", "adv.", "不久前；最近", "/' ri:.sənt. li/"],
    ["take down", "v. phr.", "拆除; 往下拽; 记录", "/teɪk//daʊn/"],
    ["terrorist", "n.", "恐怖主义者；恐怖分子", "/' ter.ə. rɪst/"],
    ["date", "n.", "日期；日子", "/deɪt/"],
    ["tower", "n.", "塔；塔楼", "/taʊər/"],
    ["truth", "n.", "实情；事实", "/ tru:θ/"],
  ],
  'g8b-u6': [
    ["shoot (shot)", "v.", "射击；发射", "/ʃu:t/ (/ʃɒt/)"],
    ["stone", "n.", "石头", "/stəʊn/"],
    ["weak", "adj.", "虚弱的；无力的", "/ wi:k/"],
    ["god", "n.", "神; 上帝(God)", "/gɒd/"],
    ["remind", "v.", "提醒；使想起", "/rɪ'maɪnd/"],
    ["bit", "adj.", "一点; 小块", ""],
    ["a little bit", "adv. phr.", "有点儿; 稍微", "/ə//'lɪt.əl/ /bɪt/"],
    ["silly", "adj.", "愚蠢的；不明事理的", "/'sɪl. i/"],
    ["instead of", "", "代替；反而", "/ɪn' sted ˌəv/"],
    ["turn ... into", "v. phr.", "变成", "/tɜ:n//'ɪn. tu:/"],
    ["object", "n.", "物体；物品", "/'ɒb. dʒekt/"],
    ["hide (hid)", "v.", "隐藏；隐蔽", "/haɪd/ (/hɪd/)"],
    ["tail", "n.", "尾巴", "/teɪl/"],
    ["magic", "adj.", "有魔力的；有神奇力量的", "/'mædʒ.ɪk/"],
    ["stick", "n.", "棍; 条", "/stɪk/"],
    ["excite", "v.", "使激动；使兴奋", "/ɪk'saɪt/"],
    ["Western", "adj.", "西方国家的；(尤指)欧美的；西方的(w可以小写)", "/' wes.tən/"],
    ["once upon a time", "adv.", "从前", "/wʌns/ /ə'pɒn/ /ə//taɪm/"],
    ["stepsister", "n.", "继姐(妹)", "/'stepˌsɪs.tər/"],
    ["prince", "n.", "王子", "/prɪns/"],
    ["fall in love", "v. phr.", "爱上; 喜欢上", "/fɔ:l/ /ɪn/ /lʌv/"],
    ["fit", "v.", "适合；合身", "/fɪt/"],
    ["couple", "n.", "(尤指)夫妻；两人；两件事物", "/'kʌp.əl/"],
    ["smile", "v.&n.", "笑; 微笑", "/smaɪl/"],
    ["marry", "v.", "结婚", "/'mær. i/"],
    ["get married", "v. phr.", "结婚", "/ get//'mær. id/"],
    ["gold", "n.", "金子;金币 adj.金色的", "/gəʊld/"],
    ["emperor", "n.", "皇帝", "/' em.pər.ər/"],
    ["silk", "n.", "丝绸；丝织物", "/sɪlk/"],
    ["underwear", "n.", "内衣", "/'ʌn.də.weər/"],
    ["nobody", "pron.", "没有人 n.小人物", "/'nəʊ.bə. di/"],
    ["stupid", "adj.", "愚蠢的", "/' stju:. pɪd/"],
    ["cheat", "v.", "欺骗；受骗 n.骗子", "/tʃi:t/"],
    ["stepmother", "n.", "继母", "/'stepˌmʌð.ər/"],
    ["wife", "n.", "妻子；太太", "/waɪf/"],
    ["husband", "n.", "丈夫", "/'hʌz.bənd/"],
    ["whole", "adj.", "全部的；整体的", "/həʊl/"],
    ["scene", "n.", "(戏剧或歌剧的)场；场景", "/ si:n/"],
    ["moonlight", "n.", "月光", "/' mu:n. laɪt/"],
    ["shine", "v.", "发光；照耀", "/ʃaɪn/(/ʃɒn/)"],
    ["bright", "adv.", "光亮地；明亮地adj.明亮的；光线充足的", "/braɪt/"],
    ["ground", "n.", "地；地面", "/graʊnd/"],
    ["lead (led)", "v.", "带路；领路", "/ li:d/(/ led/)"],
    ["voice", "n.", "声音", "/vɔɪs/"],
    ["brave", "adj.", "勇敢的；无畏的", "/breɪv/"],
  ],
  'g8b-u7': [
    ["square", "adj.", "平方；正方形的n.正方形；广场", "/skweər/"],
    ["meter/ metre", "n.", "米；公尺", "/' mi:.tər/"],
    ["deep", "adj.", "深的；纵深的", "/ di:p/"],
    ["desert", "n.", "沙漠", "/' dez.ət/"],
    ["Asia", "n.", "亚洲", "/'eɪ.ʒə/"],
    ["feel free", "v. phr.", "(可以)随便(做某事)", "/ fi:l/ / fri:/"],
    ["tour", "n.&v.", "旅行; 旅游", "/tʊər/"],
    ["tourist", "n.", "旅行者；观光者", "/'tʊə. rɪst/"],
    ["wall", "n.", "墙", "/wɔ:l/"],
    ["amazing", "adj.", "令人大为惊奇的；令人惊喜(或惊叹)的", "/ə'meɪ. zɪŋ/"],
    ["ancient", "adj.", "古代的；古老的", "/'eɪn.ʃənt/"],
    ["protect", "v.", "保护；防护", "/prə' tekt/"],
    ["wide", "adj.", "宽的；宽阔的", "/waɪd/"],
    ["as far as I know", "", "就我所知", "/æz/ /fɑ:r/ /æz/ /aɪ//nəʊ/"],
    ["man-made", "adj.", "人造的", "/ˌmæn'meɪd/"],
    ["achievement", "n.", "成就；成绩", "/ə'tʃi:v.mənt/"],
    ["southwestern", "adj.", "西南的；西南方向的", "/,saʊθ' wes.tən/"],
    ["thick", "adj.", "厚的; 浓的", "/θɪk/"],
    ["include", "v.", "包括；包含", "/ɪn' klu:d/"],
    ["freezing", "adj.", "极冷的；冰冻的", "/' fri:. zɪŋ/"],
    ["condition", "n.", "条件；状况", "/kən'dɪʃ.ən/"],
    ["take in", "v. phr.", "吸入", "/teɪk/ /ɪn/"],
    ["succeed", "v.", "实现目标；成功", "/sək' si:d/"],
    ["challenge", "v.&n.", "挑战; 考验", "/'tʃæl.ɪndʒ/"],
    ["in the face of", "", "面对(问题、困难等)", "/ɪn/ /ðə/ /feɪs/ /əv/"],
    ["achieve", "v.", "达到；完成；成功", "/ə'tʃi:v/"],
    ["force", "n.", "力；力量", "/fɔ:s/"],
    ["nature", "n.", "自然界；大自然", "/'neɪ. tʃər/"],
    ["eventhough/even if", "", "即使；虽然", "/'i:.vən/ /ðəʊ///'i:.vən/ /ɪf/"],
    ["ocean", "n.", "大海；海洋", "/'əʊ.ʃən/"],
    ["the Pacific Ocean", "n.", "太平洋", "/ðə//pə'sɪf.ɪk//'əʊ.ʃən/"],
    ["cm / centimeter /centimetre", "n.", "厘米", "/' sen.tə, mi:.tə/"],
    ["weigh", "v.", "重量是……；称……的重量", "/weɪ/"],
    ["birth", "n.", "出生；诞生", "/bɜːθ/"],
    ["at birth", "", "出生时", "/æt//bɜːθ/"],
    ["up to", "", "到达(某数量、程度等)；至多有；不多于", "/ʌp// tu:/"],
    ["adult", "adj.", "成年的；成人的n.成人；成年动物", "/'æd.ʌlt/"],
    ["bamboo", "n.", "竹子", "/bæm' bu:/"],
    ["endangered", "adj.", "濒危的", "/ɪn'deɪn. dʒəd/"],
    ["research", "n.&v.", "研究；调查(用作名词时，重音可放在第一个音节)", "/rɪ'sɜːtʃ/"],
    ["keeper", "n.", "饲养员；保管人", "/' ki:.pər/"],
    ["awake", "adj.", "醒着", "/ə'weɪk/"],
    ["excitement", "n.", "激动；兴奋", "/ɪk'saɪt.mənt/"],
    ["walk into", "v. phr.", "走路时撞着", "/wɔ:k//'ɪn. tu:/"],
    ["fall over", "v. phr.", "绊倒", "/fɔ:l//'əʊ.vər/"],
    ["or so", "adv.", "Phr.大约", "/ɔ:r//səʊ/"],
    ["illness", "n.", "疾病；病", "/'ɪl.nəs/"],
    ["wild", "adj.", "野生的", "/waɪld/"],
    ["government", "n.", "政府；内阁", "/'gʌv.ə.mənt/"],
    ["whale", "n.", "鲸", "/weɪl/"],
    ["oil", "n.", "油；食用油；石油", "/ɔɪl/"],
    ["protection", "n.", "保护；保卫", "/prə' tek.ʃən/"],
    ["huge", "adj.", "巨大的；极多的", "/ hju:dʒ/"],
  ],
  'g8b-u8': [
    ["treasure", "n.", "珠宝；财富", "/'treʒ.ər/"],
    ["island", "n.", "岛", "/'aɪ.lənd/"],
    ["full of", "adj.", "满是……的; (有)大量的;(有)丰富的", "/fʊl/ /əv/"],
    ["classic", "n.", "经典作品；名著", "/'klæs.ɪk/"],
    ["page", "n.", "(书刊或纸张的)页；面；张", "/peɪdʒ/"],
    ["hurry", "v.", "匆忙；赶快", "/'hʌr. i/"],
    ["hurry up", "v. phr.", "赶快; 急忙(做某事)", "/'hʌr. i//ʌp/"],
    ["due", "adj.", "预期; 预定", "/ dju:/"],
    ["fishermanpl.fishermen", "n.", "渔民；钓鱼者", "/'fɪʃ.ə.mən/"],
    ["pull", "v.", "拉; 拖", "/pʊl/"],
    ["shark", "n.", "鲨鱼", "/ʃɑːk/"],
    ["bone", "n.", "骨头", "/bəʊn/"],
    ["defeat", "v.&n.", "击败; 战胜", "/dɪ' fi:t/"],
    ["destroy", "v.", "摧毁；毁坏", "/dɪ'strɔɪ/"],
    ["recommend", "v.", "推荐；建议", "/ˌrek.ə' mend/"],
    ["title", "n.", "名称；标题；题目", "/'taɪ.təl/"],
    ["fiction", "n.", "小说", "/'fɪk.ʃən/"],
    ["science fiction", "n.", "科幻小说(或影片等)", "/'saɪ.əns//'fɪk.ʃən/"],
    ["technology", "n.", "科技；工艺", "/ tek'nɒl.ə. dʒi/"],
    ["French", "n.", "法语", "/frentʃ/"],
    ["pop", "n.", "流行音乐；流行乐曲", "/pɒp/"],
    ["rock", "n.", "摇滚乐", "/rɒk/"],
    ["band", "n.", "乐队", "/bænd/"],
    ["country(music)", "n.", "乡村音乐", "/'kʌn. tri//' mju:. zɪk/"],
    ["forever", "adv.", "永远", "/fə' re.vər/"],
    ["abroad", "adv.", "在国外；到国外", "/ə'brɔ:d/"],
    ["actually", "adv.", "真实地；事实上", "/'æk. tʃu.ə. li/"],
    ["ever since", "", "自从", "/' ev.ər/ /sɪns/"],
    ["fan", "n.", "迷；狂热爱好者", "/fæn/"],
    ["southern", "adj.", "南方的", "/'sʌð.ən/"],
    ["modern", "adj.", "现代的；当代的", "/'mɒd.ən/"],
    ["success", "n.", "成功", "/sək' ses/"],
    ["belong", "v.", "属于；归属", "/bɪ'lɒŋ/"],
    ["one another", "pron.", "互相", "/wʌn//ə'nʌð.ər/"],
    ["laughter", "n.", "笑；笑声", "/' la:f.tər/"],
    ["beauty", "n.", "美；美丽", "/' bju:. ti/"],
    ["million", "num.", "一百万", "/'mɪl.jən/"],
    ["record", "n.", "唱片;记录 v.录制;录(音)", "/' rek.ɔ:d//rɪ'kɔ:d/"],
    ["introduce", "v.", "介绍；引见", "/ˌɪn.trə'dʒu:s/"],
    ["line", "n.", "行; 排", "/laɪn/"],
  ],
  'g8b-u9': [
    ["amusement", "n.", "娱乐；游戏", "/ə' mju:z.mənt/"],
    ["amusement park", "n.", "游乐场", "/ə' mju:z.mənt//pɑːk/"],
    ["somewhere", "adv.", "在某处；到某处", "/'sʌm.weər/"],
    ["camera", "n.", "照相机；摄影机；摄像机", "/'kæm.rə/"],
    ["invention", "n.", "发明；发明物", "/ɪn' ven.ʃən/"],
    ["invent", "v.", "发明；创造", "/ɪn' vent/"],
    ["unbelievable", "adj.", "难以置信的；不真实的", "/ˌʌn. bɪ' li:.və.bəl/"],
    ["progress", "n.&v.", "进步; 进展", "/'prəʊ. gres//prə' gres/"],
    ["rapid", "adj.", "迅速的；快速的", "/'ræp.ɪd/"],
    ["unusual", "adj.", "特别的；不寻常的", "/ʌn' ju:.ʒu.əl/"],
    ["toilet", "n.", "坐便器；厕所", "/'tɔɪ.lət/"],
    ["encourage", "v.", "鼓励", "/ɪn'kʌr.ɪdʒ/"],
    ["social", "adj.", "社会的", "/'səʊ.ʃəl/"],
    ["peaceful", "adj.", "和平的；安宁的", "/' pi:s.fəl/"],
    ["tea art", "n.", "茶艺", "/ ti:/ /ɑ:t/"],
    ["performance", "n.", "表演；演出", "/pə'fɔ:.məns/"],
    ["perfect", "adj.", "完美的；完全的", "/'pɜː. fekt/"],
    ["tea set", "n.", "茶具", "/ ti:/ / set/"],
    ["itself (it 的反身代词)", "pron.", "它自己", "/ɪt' self/"],
    ["collect", "v.", "收集；采集", "/kə' lekt/"],
    ["a couple of", "adj.", "两个；一对；几个", "/ə//'kʌp.əl/ /əv/"],
    ["German", "adj.", "德国(人)的；德语的n.德语；德国人", "/'dʒɜː.mən/"],
    ["theme", "n.", "主题", "/θi:m/"],
    ["ride", "n.", "供乘骑的游乐设施；短途旅程", "/raɪd/"],
    ["province", "n.", "省份", "/'prɒv.ɪns/"],
    ["thousand", "num.", "一千", "/'θaʊ.zənd/"],
    ["thousands of", "adj.", "数以干计的；许许多多的", "/'θaʊ.zəndz/ /əv/"],
    ["on the one hand…on the other hand", "", "一方面……另一方面……", "/ɒn/ /ðə/ /wʌn//hænd//'ʌð.ər/"],
    ["safe", "adj.", "安全的；无危险的", "/seɪf/"],
    ["population", "n.", "人口；人口数量", "/,pɒp.jə'leɪ.ʃən/"],
    ["simply", "adv.", "仅仅; 只; 不过", "/'sɪm. pli/"],
    ["fear", "v.&n.", "害怕; 惧怕", "/fɪər/"],
    ["whether", "conj.", "不管……(还是);或者……(或者)；是否", "/'weð.ər/"],
    ["Indian", "adj.", "印度的 n.印度人", "/'ɪn. di.ən/"],
    ["Japanese", "adj.", "日本(人)的；日语的n.日本人；日语", "/ˌdʒæp.ən'i:z/"],
    ["fox", "n.", "狐狸", "/fɒks/"],
    ["all year round", "adv. phr.", "全年", "/ɔ:l/ /jɪər/ /raʊnd/"],
    ["equator", "n.", "赤道", "/ɪ'kweɪ.tər/"],
    ["whenever", "conj.", "在任何……的时候；无论何时", "/ wen' ev.ər/"],
    ["spring", "n.", "春天", "/sprɪŋ/"],
    ["mostly", "adv.", "主要地；通常", "/'məʊst. li/"],
    ["location", "n.", "地点；位置", "/ləʊ'keɪ.ʃən/"],
  ],
  'g8b-u10': [
    ["yard", "n.", "院子", "/jɑ:d/"],
    ["yard sale", "n.", "庭院拍卖会", "/'jɑːd ˌseɪl/"],
    ["sweet", "adj.", "甜蜜的；甜的；含糖的", "/ swi:t/"],
    ["memory", "n.", "记忆；回忆", "/' mem.ər. i/"],
    ["cent", "n.", "分；分币", "/ sent/"],
    ["toy", "n.", "玩具", "/tɔɪ/"],
    ["bear", "n.", "熊", "/beər/"],
    ["maker", "n.", "生产者；制订者", "/'meɪ.kər/"],
    ["bread maker", "n.", "面包机", "/ bred//'meɪ.kər/"],
    ["scarf", "n.", "围巾；披巾；头巾", "/ skɑ:f/"],
    ["soft", "adj.", "软的；柔软的", "/sɒft/"],
    ["soft toy", "n.", "软体玩具；布绒玩具", "/sɒft/ /tɔɪ/"],
    ["check", "v.&n.", "检查; 审查", "/tʃek/"],
    ["check out", "v. phr.", "察看; 观察", "/tʃek/ /aʊt/"],
    ["board", "n.", "板；木板", "/bɔ:d/"],
    ["board game", "n.", "棋类游戏", "/'bɔ:d ˌgeɪm/"],
    ["junior", "adj.", "地位(或职位、级别)低下的", "/'dʒuː. ni.ər/"],
    ["junior high school", "n.", "初级中学", "/ˌdʒu:. ni.ə'haɪsku:l/"],
    ["clear", "v.", "清理；清除", "/klɪər/"],
    ["clear out", "v. phr.", "清理; 丢掉", "/klɪər/ /aʊt/"],
    ["bedroom", "n.", "卧室", "/' bed. ru:m/"],
    ["no longer", "", "不再；不复", "/nəʊ//'lɒŋ.gə/"],
    ["own", "v.", "拥有；有", "/əʊn/"],
    ["railway", "n.", "铁路；铁道", "/'reɪl. weɪ/"],
    ["part", "v.", "离开；分开", "/pɑːt/"],
    ["part with", "v. phr.", "放弃、交出(尤指不舍得的东西)", "/pɑːt/ /wɪð/"],
    ["certain", "adj.", "某种；某事；某人", "/'sɜː.tən/"],
    ["as for", "", "至于；关于", "/æz/ /fər/"],
    ["honest", "adj.", "诚实的；老实的", "/'ɒn.ɪst/"],
    ["to be honest", "", "说实在的", "/ tu:// bi//'ɒn.ɪst/"],
    ["while", "n.", "一段时间；一会儿", "/waɪl/"],
    ["truthful", "adj.", "诚实的；真实的", "/' tru:θ.fəl/"],
    ["gun", "n.", "枪; 炮", "/gʌn/"],
    ["sand", "n.", "沙滩；沙", "/sænd/"],
    ["hometown", "n.", "家乡；故乡", "/'həʊm. taʊn/"],
    ["search", "v.&n.", "搜索; 搜查", "/sɜːtʃ/"],
    ["among", "prep.", "在(其)中; ……之一", "/ə'mʌŋ/"],
    ["crayon", "n.", "彩色铅笔(或粉笔、蜡笔)", "/'kreɪ.ɒn/"],
    ["shame", "n.", "羞耻；羞愧；惭愧", "/ʃeɪm/"],
    ["nowadays", "adv.", "现今；现在；目前", "/'naʊ.ə. deɪz/"],
    ["century", "n.", "百年；世纪", "/' sen. tʃər. i/"],
    ["count", "v.", "数数", "/kaʊnt/"],
    ["regard", "v.", "将……认为；把……视为；看待", "/rɪ'gɑːd/"],
    ["according to", "prep. phr.", "依据; 按照", "/ə'kɔ:. dɪŋˌtu:/"],
    ["opposite", "prep.", "与……相对; 在……对面adj.对面的；另一边的", "/'ɒp.ə. zɪt/"],
    ["especially", "adv.", "尤其；特别；格外", "/ɪ'speʃ.əl. i/"],
    ["childhood", "n.", "童年；幼年", "/'tʃaɪld. hʊd/"],
    ["consider", "v.", "注视；仔细考虑", "/kən'sɪd.ər/"],
    ["close to", "phr.", "几乎; 接近", "/kləʊs/ /tʊ/"],
    ["hold (held)", "v.", "拥有；抓住", "/həʊld/ (/ held/)"],
  ],
};

const GRADE_G9A_UNIT_TITLES = ["Unit 1","Unit 2","Unit 3","Unit 4","Unit 5","Unit 6","Unit 7","Unit 8","Unit 9","Unit 10"];

const RAW_WORDS_G9A = {
  'g9a-u1': [
    ["textbook", "n.", "教科书；课本", "/' tekst. bʊk/"],
    ["conversation", "n.", "交谈；谈话", "/ˌkɒn.və'seɪ.ʃən/"],
    ["aloud", "adv.", "大声地；出声地", "/ə'laʊd/"],
    ["pronunciation", "n.", "发音；读音", "/prə,nʌn. si'eɪ.ʃən/"],
    ["sentence", "n.", "句子", "/' sen.təns/"],
    ["patient", "adj.", "有耐心的n.病人", "/'peɪ.ʃənt/"],
    ["secret", "n.", "秘密；秘诀 adj.秘密的；保密的", "/' si:.krət/"],
    ["expression", "n.", "表情；表示；表达方式", "/ɪk'spreʃ.ən/"],
    ["discover", "v.", "发现；发觉", "/dɪ'skʌv.ər/"],
    ["look up", "v. phr.", "(在词典、参考书中或通过电脑)查阅；抬头看", "/lʊk//ʌp/"],
    ["grammar", "n.", "语法", "/'græm.ər/"],
    ["repeat", "v.", "重复；重做", "/rɪ' pi:t/"],
    ["note", "n.", "笔记；记录 v.注意；指出", "/nəʊt/"],
    ["pal", "n.", "朋友；伙伴", "/pæl/"],
    ["physics", "n.", "物理；物理学", "/'fɪz.ɪks/"],
    ["chemistry", "n.", "化学", "/' kem.ɪ. stri/"],
    ["memorize", "v.", "记忆；记住", "/' mem.ə. raɪz/"],
    ["pattern", "n.", "模式；方式", "/'pæt.ən/"],
    ["novel", "n.", "(长篇)小说", "/'nɒv.əl/"],
    ["pronounce", "v.", "发音", "/prə'naʊns/"],
    ["increase", "v.", "增加；增长", "/ɪn' kri:s/"],
    ["speed", "n.", "速度", "/ spi:d/"],
    ["review", "v.&n.", "回顾; 复习", "/rɪ' vju:/"],
    ["partner", "n.", "搭档；同伴", "/'pɑːt.nər/"],
    ["born", "v.", "出生 adj.天生的", "/bɔ:n/"],
    ["be born with", "v. phr.", "生来具有；天生具有", "/ bi://bɔ:n//wɪð/"],
    ["ability", "n.", "能力；才能", "/ə'bɪl.ə. ti/"],
    ["create", "v.", "创造；创建", "/ kri'eɪt/"],
    ["brain", "n.", "大脑", "/breɪn/"],
    ["active", "adj.", "活跃的；积极的", "/'æk. tɪv/"],
    ["attention", "n.", "注意；关注", "/ə' ten.ʃən/"],
    ["pay attention to", "v. phr.", "注意; 关注", "/peɪ//ə' ten.ʃən// tu:/"],
    ["connect", "v.", "(使)连接；与……有联系", "/kə' nekt/"],
    ["connect ... with", "v. phr.", "把…和……连接或联系起来", "/kə' nekt/ /wɪð/"],
    ["overnight", "adv.", "一夜之间；在夜间", "/ˌəʊ.və'naɪt/"],
    ["knowledge", "n.", "知识；学问", "/'nɒl.ɪdʒ/"],
    ["lifelong", "adj.", "终身的；毕生的", "/'laɪf. lɒŋ/"],
    ["wisely", "adv.", "明智地；聪明地", "/'waɪz. li/"],
  ],
  'g9a-u2': [
    ["mooncake", "n.", "月饼", "/' mu:n. keɪk/"],
    ["lantern", "n.", "灯笼", "/'læn.tən/"],
    ["stranger", "n.", "陌生人", "/'streɪn. dʒər/"],
    ["relative", "n.", "亲属；亲戚", "/' rel.ə. tɪv/"],
    ["put on", "v. phr.", "增加(体重); 发胖", "/pʊt/ /ɒn/"],
    ["pound", "n.", "磅(重量单位)；英镑(英国货币单位)", "/paʊnd/"],
    ["folk", "adj.", "民间的；民俗的", "/fəʊk/"],
    ["goddess", "n.", "女神", "/'gɒd. es/"],
    ["whoever", "pron.", "无论谁；不管什么人", "/ hu:' ev.ər/"],
    ["steal", "v.", "偷；窃取 stolen)", "/ sti:l//stəʊl//'stəʊ.lən/"],
    ["lay (laid, laid)", "v.", "放置; 安放; 产(卵);下(蛋)", "/leɪ/(/leɪd/)"],
    ["lay out", "v. phr.", "摆开; 布置", "/leɪ/ /aʊt/"],
    ["dessert", "n.", "(饭后)甜点；甜食", "/dɪ'zɜːt/"],
    ["garden", "n.", "花园；园子", "/'gɑː.dən/"],
    ["tradition", "n.", "传统", "/trə'dɪʃ.ən/"],
    ["admire", "v.", "欣赏；仰慕", "/əd'maɪər/"],
    ["treat", "n.", "款待;招待 v.招待;请(客)", "/ tri:t/"],
    ["tie", "n.", "领带 v.捆; 束", "/taɪ/"],
    ["dinosaur", "n.", "恐龙", "/'daɪ.nə.sɔ:r/"],
    ["mushroom", "n.", "蘑菇", "/'mʌʃ. ru:m/"],
    ["togetherness", "n.", "和睦相处；亲密无间", "/tə'geð.ə.nəs/"],
    ["happiness", "n.", "快乐；高兴", "/'hæp. i.nəs/"],
    ["lunar", "adj.", "月球的；月亮的", "/' lu:.nər/"],
    ["riddle", "n.", "谜；谜语", "/'rɪd.əl/"],
    ["celebration", "n.", "庆典；庆祝活动", "/ˌsel.ə'breɪ.ʃən/"],
    ["firework", "n.", "烟火;烟花 (pl.)烟花表演", "/'faɪə. wɜːk/"],
    ["take place", "v. phr.", "发生", "/teɪk//pleɪs/"],
    ["gather", "v.", "聚集；集合", "/'gæð.ər/"],
    ["count down", "v. phr.", "倒计时", "/kaʊnt//daʊn/"],
    ["custom", "n.", "风俗；习俗", "/'kʌs.təm/"],
    ["involve", "v.", "包含；牵涉", "/ɪn'vɒlv/"],
    ["crowd", "n.", "人群；观众", "/kraʊd/"],
    ["bottom", "n.", "底部；最下部", "/'bɒt.əm/"],
    ["dust", "n.", "沙土；尘土；v.擦灰；掸去", "/dʌst/"],
    ["couplet", "n.", "对联；对句", "/'kʌp.lət/"],
    ["set off(sth.)", "v. phr.", "点燃; 使……爆炸", "/ set/ /ɒf/"],
    ["eve", "n.", "前夕；前夜", "/i:v/"],
    ["express", "v.", "表达；表示", "/ɪk' spres/"],
    ["reunion", "n.", "团圆；团聚", "/ˌri:' ju:.njən/"],
    ["smell(smelt, smelt;smelled, smelled)", "v.", "闻到；发出……气味n.气味；臭味", "/ smel// smelt// smeld/"],
    ["breeze", "n.", "微风；和风", "/ bri:z/"],
    ["picnic", "n.&v.", "野餐", "/'pɪk. nɪk/"],
    ["coming", "adj.", "即将发生的；下一个的n.到来", "/'kʌm.ɪŋ/"],
  ],
  'g9a-u3': [
    ["restroom", "n.", "(美)洗手间；公共厕所", "/' rest. ru:m/"],
    ["stamp", "n.", "邮票；印章", "/stæmp/"],
    ["bookstore", "n.", "书店", "/'bʊk.stɔ:r/"],
    ["beside", "prep.", "在……旁边; 在……附近", "/bɪ'saɪd/"],
    ["postcard", "n.", "明信片", "/'pəʊst. kɑːd/"],
    ["pardon", "v.", "原谅interj.请再说一遍", "/'pɑ:.dən/"],
    ["washroom", "n.", "洗手间；厕所", "/'wɒʃ. ru:m/"],
    ["bathroom", "n.", "浴室；洗手间", "/' ba:θ. ru:m/"],
    ["normally", "adv.", "通常；正常情况下", "/'nɔ:.mə. li/"],
    ["rush", "v.&n.", "仓促; 急促", "/rʌʃ/"],
    ["suggest", "v.", "建议；提议", "/sə'dʒest/"],
    ["pass by", "v. phr.", "路过; 经过", "/pɑːs//baɪ/"],
    ["staff", "n.", "管理人员；职工", "/stɑ:f/"],
    ["grape", "n.", "葡萄", "/greɪp/"],
    ["policemanpl.policemen", "n.", "男警察", "/pə' li:s.mən//pə' li:s.mən/"],
    ["central", "adj.", "中心的；中央的", "/' sen.trəl/"],
    ["nearby", "adj.", "附近的; 邻近的 adv.(在)附近", "/ˌnɪə'baɪ/"],
    ["pardon me", "", "抱歉；对不起；什么，请再说一遍", "/'pɑː.dən/ / mi:/"],
    ["mail", "v.", "邮寄；发电子邮件 n.邮件；信件", "/meɪl/"],
    ["east", "adv.", "向东; 朝东  adj.东方的; 东部的 n.东(方)", "/i: st/"],
    ["fascinating", "adj.", "迷人的；极有吸引力的", "/'fæs.ən. eɪ. tɪŋ/"],
    ["inexpensive", "adj.", "不昂贵的", "/ˌɪn.ɪk' spen. sɪv/"],
    ["uncrowded", "adj.", "不用挤的；人少的", "/ʌn'kraʊ. dɪd/"],
    ["convenient", "adj.", "便利的；方便的", "/kən' vi:. ni.ənt/"],
    ["mall", "n.", "商场；购物中心", "/mɔ:l/"],
    ["clerk", "n.", "职员", "/klɑ:k/"],
    ["corner", "n.", "拐角；角落", "/'kɔ:.nər/"],
    ["politely", "adv.", "礼貌地；客气地", "/pə'laɪt. li/"],
    ["request", "n.&v.", "要求; 请求", "/rɪ' kwest/"],
    ["direction", "n.", "方向；方位", "/daɪ' rek.ʃən//dɪ' rek.ʃən/"],
    ["correct", "adj.", "正确的；恰当的", "/kə' rekt/"],
    ["polite", "adj.", "有礼貌的；客气的", "/pə'laɪt/"],
    ["direct", "adj.", "直接的；直率的", "/daɪ' rekt/"],
    ["speaker", "n.", "讲(某种语言)的人；发言者", "/' spi:.kər/"],
    ["whom", "pron.", "谁; 什么人", "/ hu:m/"],
    ["impolite", "adj.", "不礼貌的；粗鲁的", "/ˌɪm.pəl'aɪt/"],
    ["address", "n.", "住址；地址；通信处", "/ə' dres/"],
    ["underground", "adj.", "地下的 n.地铁", "/ˌʌn.də'graʊnd/"],
    ["parking lot", "n. phr.", "停车场; 停车区", "/'pɑː. kɪŋˌlɒt/"],
    ["course", "n.", "课程；学科", "/kɔ:s/"],
  ],
  'g9a-u4': [
    ["humorous", "adj.", "有幽默感的；滑稽有趣的", "/' hju:.mə.rəs/"],
    ["silent", "adj.", "不说话的；沉默的", "/'saɪ.lənt/"],
    ["helpful", "adj.", "有用的；有帮助的", "/' help.fəl/"],
    ["from time to time", "adv. phr.", "时常; 有时", "/frɒm/ /taɪm// tu://taɪm/"],
    ["score", "n.&v.", "得分; 进球", "/skɔ:r/"],
    ["background", "n.", "背景", "/'bæk. graʊnd/"],
    ["interview", "v.", "采访；面试 n.面试；访谈", "/'ɪn.tə. vju:/"],
    ["Asian", "adj.", "亚洲(人)的 n.亚洲人", "/'eɪ.ʒən/"],
    ["deal (dealt, dealt)", "v.", "对付；对待", "/ di:l/ / delt/"],
    ["deal with", "v. phr.", "应对; 处理", "/ di:l//wɪð/"],
    ["shyness", "n.", "害羞；腼腆", "/'ʃaɪ.nəs/"],
    ["dare", "v.", "敢于；胆敢", "/deər/"],
    ["ton", "n.", "吨 (pl.)大量; 许多", "/tʌn/"],
    ["private", "adj.", "私人的；秘密的", "/'praɪ.vət/"],
    ["guard", "n.", "警卫；看守 v.守卫；保卫", "/gɑ:d/"],
    ["require", "v.", "需要；要求", "/rɪ'kwaɪər/"],
    ["European", "adj.", "欧洲(人)的 n.欧洲人", "/,jʊə.rə' pi:.ən/"],
    ["African", "adj.", "非洲(人)的 n.非洲人", "/'æf. rɪ.kən/"],
    ["British", "adj.", "英国(人)的", "/'brɪt.ɪʃ/"],
    ["insect", "n.", "昆虫", "/'ɪn. sekt/"],
    ["ant", "n.", "蚂蚁", "/ænt/"],
    ["speech", "n.", "讲话；发言", "/ spi:tʃ/"],
    ["public", "n.", "民众 adj.公开的；公众的", "/'pʌb. lɪk/"],
    ["in public", "adv. phr.", "公开地;在别人(尤指生人)面前", "/ɪn//'pʌb. lɪk/"],
    ["spider", "n.", "蜘蛛", "/'spaɪ.dər/"],
    ["seldom", "adv.", "不常; 很少", "/' sel.dəm/"],
    ["influence", "v.&n.", "影响", "/'ɪn. flu.əns/"],
    ["absent", "adj.", "缺席; 不在", "/'æb.sənt/"],
    ["fail", "v.", "不及格；失败；未能(做到)", "/feɪl/"],
    ["examination", "n.", "考试；审查", "/ɪg.zæm.ɪ'neɪ.ʃən/"],
    ["boarding school", "n.", "寄宿学校", "/'bɔ:. dɪŋˌ sku:l/"],
    ["in person", "adv. phr.", "亲身; 亲自", "/ɪn//'pɜː.sən/"],
    ["exactly", "adv.", "确切地；精确地", "/ɪg'zækt. li/"],
    ["pride", "n.", "自豪；骄傲", "/praɪd/"],
    ["take pride in", "v. phr.", "为……骄傲; 感到自豪", "/teɪk/ /praɪd/ /ɪn/"],
    ["proud", "adj.", "自豪的；骄傲的", "/praʊd/"],
    ["be proud of", "v. phr.", "为……骄傲; 感到自豪", "/ bi://praʊd/ /əv/"],
    ["general", "adj.", "总的；普遍的；常规的 n.将军", "/'dʒen.ər.əl/"],
    ["introduction", "n.", "介绍", "/ˌɪn.trə'dʌk.ʃən/"],
  ],
  'g9a-u5': [
    ["chopstick", "n.", "筷子", "/'tʃɒp. stɪk/"],
    ["coin", "n.", "硬币", "/kɔɪn/"],
    ["fork", "n.", "餐叉；叉子", "/fɔ:k/"],
    ["blouse", "n.", "(女士)短上衣；衬衫", "/blaʊz/"],
    ["silver", "n.", "银; 银器 adj.银色的", "/'sɪl.vər/"],
    ["glass", "n.", "玻璃", "/glɑːs/"],
    ["cotton", "n.", "棉；棉花", "/'kɒt.ən/"],
    ["steel", "n.", "钢；钢铁", "/ sti:l/"],
    ["fair", "n.", "展览会；交易会", "/feər/"],
    ["environmental", "adj.", "自然环境的；有关环境的", "/ɪn. vaɪ.rə' men.təl/"],
    ["grass", "n.", "草；草地", "/grɑːs/"],
    ["leaf pl. leaves", "n.", "叶；叶子", "/ li:f/ / li: vz/"],
    ["produce", "v.", "生产；制造；出产", "/prə'dʒuːs/"],
    ["widely", "adv.", "广泛地；普遍地", "/'waɪd. li/"],
    ["be known for", "v. phr.", "以……闻名; 为人知晓", "/ bi://nəʊn/ /fɔ:r/"],
    ["process", "v.", "加工；处理 n.过程", "/'prəʊ. ses/"],
    ["pack", "v.", "包装；装箱", "/pæk/"],
    ["business", "n.", "生意；商业", "/'bɪz. nɪs/"],
    ["product", "n.", "产品；制品", "/'prɒd.ʌkt/"],
    ["France", "n.", "法国", "/frɑ: ns/"],
    ["no matter", "", "不论；无论", "/nəʊ//'mæt.ər/"],
    ["local", "adj.", "当地的；本地的", "/'ləʊ.kəl/"],
    ["brand", "n.", "品牌；牌子", "/brænd/"],
    ["avoid", "v.", "避免；回避", "/ə'vɔɪd/"],
    ["handbag", "n.", "小手提包", "/'hænd.bæg/"],
    ["mobile", "adj.", "可移动的；非固定的", "/'məʊ. baɪl/"],
    ["everyday", "adj.", "每天的；日常的", "/' ev. ri. deɪ/"],
    ["boss", "n.", "老板；上司", "/bɒs/"],
    ["Germany", "n.", "德国", "/'dʒɜː.mə. ni/"],
    ["surface", "n.", "表面；表层", "/'sɜ:. fɪs/"],
    ["material", "n.", "材料；原料", "/mə'tɪə. ri.əl/"],
    ["punish", "adj.", "处罚; 惩罚", "/'pʌn.ɪʃ/"],
    ["traffic", "n.", "交通；路上行驶的车辆", "/'træf.ɪk/"],
    ["postman", "n.", "邮递员", "/'pəʊst.mən/"],
    ["cap", "n.", "(尤指有帽舌的)帽子", "/kæp/"],
    ["glove", "n.", "(分手指的)手套", "/glʌv/"],
    ["international", "adj.", "国际的", "/ˌɪn.tə'næʃ.ən.əl/"],
    ["competitor", "n.", "参赛者；竞争者", "/kəm' pet.ɪ.tər/"],
    ["its", "pron.", "它的", "/ɪts/"],
    ["form", "n.", "形式；类型", "/fɔ:m/"],
    ["clay", "n.", "黏土；陶土", "/kleɪ/"],
    ["balloon", "n.", "气球", "/bə' lu:n/"],
    ["paper cutting", "n. phr.", "剪纸", "/'peɪ.pər//'kʌt.ɪŋ/"],
    ["scissors", "n.", "(pl.)剪刀", "/'sɪz.əz/"],
    ["lively", "adj.", "生气勃勃的；(色彩)鲜艳的", "/'laɪv. li/"],
    ["fairy tale", "n. phr.", "童话故事", "/'feə. riˌteɪl/"],
    ["historical", "adj.", "(有关)历史的", "/hɪ'stɒr.ɪ.kəl/"],
    ["heat", "n.", "热；高温 v.加热；变热", "/ hi:t/"],
    ["polish", "v.", "磨光；修改；润色", "/'pɒl.ɪʃ/"],
    ["complete", "v.", "完成", "/kəm' pli:t/"],
  ],
  'g9a-u6': [
    ["heel", "n.", "鞋跟；足跟", "/ hi:l/"],
    ["scoop", "n.", "勺；铲子", "/ sku:p/"],
    ["electricity", "n.", "电；电能", "/ˌel.ɪk'trɪs.ə. ti/"],
    ["style", "n.", "样式；款式", "/staɪl/"],
    ["project", "n.", "项目；工程", "/ˈprɒdʒ. ekt/"],
    ["pleasure", "n.", "高兴；愉快", "/'pleʒ.ər/"],
    ["zipper / zip", "n.", "拉链；拉锁", "/'zɪp.ər/ /zɪp/"],
    ["daily", "adj.", "每日的；日常的", "/'deɪ. li/"],
    ["have a point", "v. phr.", "有道理", "/hæv/ /ə//pɔɪnt/"],
    ["website", "n.", "网站", "/' web. saɪt/"],
    ["pioneer", "n.", "先锋；先驱", "/ˌpaɪə'nɪər/"],
    ["list", "v.", "列单；列清单 n.名单；清单", "/lɪst/"],
    ["mention", "v.", "提到；说到", "/' men.ʃən/"],
    ["spread(spread,spread)", "v.", "传播；展开\tn.蔓延；传播", "/ spred/"],
    ["by accident", "adv. phr.", "偶然; 意外地", "/baɪ//'æk. sɪ.dənt/"],
    ["accidental", "adj.", "意外地；偶然的", "/ˌæk. sɪ' den.təl/"],
    ["ruler", "n.", "统治者；支配着", "/' ru:.lər/"],
    ["boil", "v.", "煮沸；烧开", "/bɔɪl/"],
    ["remain", "v.", "保持不变；剩余", "/rɪ'meɪn/"],
    ["sage", "n.", "圣人；智者", "/seɪdʒ/"],
    ["national", "adj.", "国家的；民族的", "/'næʃ.ən.əl/"],
    ["trade", "n.", "贸易；交易v.做买卖；从事贸易", "/treɪd/"],
    ["popularity", "n.", "受欢迎；普及", "/. pɒp.jə'lær.ə. ti/"],
    ["doubt", "n.", "疑惑；疑问 v.怀疑", "/daʊt/"],
    ["without doubt", "adv. phr.", "毫无疑问; 的确", "/wɪ'ðaʊt/ /daʊt/"],
    ["fridge", "n.", "冰箱", "/frɪdʒ/"],
    ["low", "adj.", "低的; 矮的", "/ləʊ/"],
    ["somebody", "pron.", "某人 n.重要人物", "/'sʌm.bə. di/"],
    ["wolf", "n.", "狼", "/wʊlf/"],
    ["warn", "v.", "警告；告诫", "/wɔ:n/"],
    ["translate", "v.", "翻译", "/trænz'leɪt/"],
    ["lock", "v.", "锁上;锁住 n.锁", "/lɒk/"],
    ["ring(rang, rung)", "v.", "(使)发出钟声或铃声；打电话", "/rɪŋ/ (/ræŋ/ /rʌŋ/)"],
    ["earthquake", "n.", "地震", "/'ɜ:θ. kweɪk/"],
    ["sudden", "adj.", "突然(的)", "/'sʌd.ən/"],
    ["all of a sudden", "adv. phr.", "突然; 猛地", "/ɔ:l//əv//ə//'sʌd.ən/"],
    ["bell", "n.", "钟(声);铃(声)", "/ bel/"],
    ["biscuit", "n.", "饼干", "/'bɪs. kɪt/"],
    ["cookie", "n.", "曲奇饼", "/'kʊk. i/"],
    ["musical", "adj.", "音乐的；有音乐天赋的", "/' mju:. zɪ.kəl/"],
    ["instrument", "n.", "器械；仪器；工具", "/'ɪn.strə.mənt/"],
    ["crispy", "adj.", "脆的；酥脆的", "/'krɪs. pi/"],
    ["salty", "adj.", "咸的", "/'sɒl. ti/"],
    ["sour", "adj.", "酸的；有酸味的", "/saʊər/"],
    ["by mistake", "adv. phr.", "错误地; 无意中", "/baɪ/ /mɪ'steɪk/"],
    ["customer", "n.", "顾客；客户", "/'kʌs.tə.mər/"],
    ["the Olympics", "n.", "奥林匹克运动会", "/ði:/ /ə'lɪm. pɪks/"],
    ["Canadian", "adj.", "加拿大(人)的；n.加拿大人", "/kə'neɪ. di.ən/"],
    ["divide", "v.", "分开；分散", "/dɪ'vaɪd/"],
    ["divide... into", "v. phr.", "把……分开", "/dɪ'vaɪd//'ɪn. tu:/"],
    ["basket", "n.", "篮; 筐", "/'bɑː. skɪt/"],
    ["not only ……but also…………", "", "不但……而且……", "/nɒt/ /'əʊn. li//bʌt//'ɔ:l. səʊ/"],
    ["look up to", "v. phr.", "钦佩; 仰慕", "/lʊk/ /ʌp/ / tu:/"],
    ["hero", "n.", "英雄；男主角", "/'hɪə. rəʊ/"],
    ["processional", "adj.", "职业的；专业的", "/prə'seʃ.ən.əl/"],
    ["nearly", "adv.", "几乎", "/'nɪə. li/"],
  ],
  'g9a-u7': [
    ["license/ licence", "n.", "证；证件", "/'laɪ.səns/"],
    ["safety", "n.", "安全；安全性", "/'seɪf. ti/"],
    ["smoke", "v.", "吸烟;冒烟  n.烟", "/sməʊk/"],
    ["part-time", "adj.& adv.", "兼职(的)", "/ˌpɑːt'taɪm/"],
    ["pierce", "adj.", "扎; 刺破; 穿透", "/pɪəs/"],
    ["earring", "n.", "耳环；耳饰", "/'ɪə. rɪŋ/"],
    ["flash", "n.", "闪光灯；闪光 v.闪耀；闪光", "/flæʃ/"],
    ["tiny", "adj.", "极小的；微小的", "/'taɪ. ni/"],
    ["cry", "v.&n.", "哭; 叫喊", "/kraɪ/"],
    ["field", "n.", "田野；场地", "/ fi: ld/"],
    ["hug", "n.&v.", "拥抱; 搂抱", "/hʌg/"],
    ["lift", "v.", "举起；抬高 n.电梯；搭便车", "/lɪft/"],
    ["badly", "adv.", "严重地；差；非常", "/'bæd. li/"],
    ["talk back", "v. phr.", "回嘴; 顶嘴", "/tɔ:k//bæk/"],
    ["awful", "adj.", "很坏的；讨厌的", "/'ɔ:.fəl/"],
    ["teen", "n.", "(13岁至19岁之间的)青少年", "/ ti:n/"],
    ["regret", "v.&n.", "感到遗憾；懊悔", "/rɪ' gret/"],
    ["poem", "n.", "诗；韵文", "/'pəʊ.ɪm/"],
    ["community", "n.", "社区；社团", "/kə' mju:.nə. ti/"],
    ["keep... away from", "v. phr.", "避免接近; 远离", "/ ki:p//ə'weɪ/ /frɒm/"],
    ["chance", "n.", "机会；可能性", "/tʃɑ: ns/"],
    ["make one' s own decision", "v. phr.", "自己做决定", "/meɪk//wʌns//əʊn/ /dɪ'sɪʒ.ən/"],
    ["educate", "v.", "教育；教导", "/'edʒ. u. keɪt/"],
    ["manage", "v.", "完成(困难的事)；应付(困难局面)", "/'mæn.ɪdʒ/"],
    ["society", "n.", "社会", "/sə'saɪ.ə. ti/"],
    ["get in the way of", "v. phr.", "挡……的路; 妨碍", "/ get/ /ɪn/ /ðə/ /weɪ//əv/"],
    ["support", "v.&n.", "支持", "/sə'pɔ:t/"],
    ["end up", "v. phr.", "最终成为；最后处于", "/ end/ /ʌp/"],
    ["enter", "v.", "进来；进去", "/' en.tər/"],
    ["choice", "n.", "选择；挑选", "/tʃɔɪs/"],
  ],
  'g9a-u8': [
    ["whose", "adj.& pron.", "谁的", "/ hu:z/"],
    ["truck", "n.", "卡车；货车", "/trʌk/"],
    ["rabbit", "n.", "兔；野兔", "/'ræb.ɪt/"],
    ["attend", "v.", "出席；参加", "/ə' tend/"],
    ["valuable", "adj.", "贵重的；很有用的；宝贵的", "/'væl.jə.bəl/"],
    ["pink", "adj.", "粉红色的  n.粉红色", "/pɪŋk/"],
    ["anybody", "pron.", "任何人", "/' en. iˌbɒd. i/"],
    ["déjà vu", "n.", "似曾经历过的感觉；似曾相识", "/ˌdeɪ.ʒɑː ' vu:/"],
    ["mystery", "n.", "奥秘；神秘事物", "/'mɪs.tər. i/"],
    ["be known as", "v. phr.", "被称为;被认为是", "/ bi://nəʊn/ /æz/"],
    ["theory", "n.", "学说；理论；看法", "/'θɪə. ri/"],
    ["familiar", "adj.", "熟悉的；常见到的", "/fə'mɪl. i.ər/"],
    ["hidden", "adj.", "秘密的；隐藏的", "/'hɪd.ən/"],
    ["power", "n.", "能力；权力", "/paʊər/"],
    ["link", "n.", "联系；连接", "/lɪŋk/"],
    ["parallel", "adj.", "平行(的)；同时发生的", "/'pær.ə. lel/"],
    ["universe", "n.", "宇宙", "/' ju:. nɪ. V3:s/"],
    ["parallel universe", "n.", "平行宇宙", "/'pær.ə. lel//' ju:. nɪ. vɜːs/"],
    ["mix-up", "n.", "混乱；杂乱", "/mɪks ʌp/"],
    ["generallyspeaking", "adv.", "一般来说", "/'dʒen.ə r.əl. i//' spi:. kɪŋ/"],
    ["trick", "n.", "引起错觉(或记忆紊乱)的事物；诡计  v.欺骗；欺诈", "/trɪk/"],
    ["unsolved", "adj.", "未解决的；未破解的", "/ˌʌn'sɒlvd/"],
    ["laboratory", "n.", "实验室", "/lə'bɒr.ə.tər. i/"],
    ["outdoors", "adv.", "在户外；在野外", "/ˌaʊt'dɔ:z/"],
    ["coat", "n.", "外套；外衣", "/kəʊt/"],
    ["lie (lay, lain)", "n.", "平躺；处于", "/laɪ/ /leɪ/ /leɪn/"],
    ["sleepy", "adj.", "困倦的；瞌睡的", "/' sli:. pi/"],
    ["land", "v.", "着陆；降落", "/lænd/"],
    ["alien", "n.", "外星人", "/'eɪ. li.ən/"],
    ["run after", "v. phr.", "追逐; 追赶", "/rʌn//'ɑ:f.tər/"],
    ["suit", "n.", "西服；套装 v.适合", "/ su:t/ / sju:t/"],
    ["at the same time", "adv. phr.", "同时; 一起", "/æt/ /ðə/ /seɪm/ / taɪm/"],
    ["circle", "n.", "圆圈  v.圈出", "/'sɜː.kəl/"],
    ["Britain/GreatBritain", "n.", "大不列颠", "/'brɪt.ən/ 、/greɪt//'brɪt.ən/"],
    ["receive", "v.", "接待；接受；收到", "/rɪ' si:v/"],
    ["historian", "n.", "历史学家；史学工作者", "/hɪ'stɔ:. ri.ən/"],
    ["temple", "n.", "庙宇；寺院；圣殿", "/' tem.pəl/"],
    ["leader", "n.", "领导；领袖", "/' li:.dər/"],
    ["midsummer", "n.", "仲夏；中夏", "/ˌmɪd'sʌm.ər/"],
    ["medical", "adj.", "医疗的；医学的", "/' med.ɪ.kəl/"],
    ["purpose", "n.", "目的；目标", "/'pɜː.pəs/"],
    ["prevent", "v.", "阻止；阻挠", "/prɪ' vent/"],
    ["energy", "n.", "力量；精力", "/' en.ə. dʒi/"],
    ["position", "n.", "位置；地方", "/pə'zɪʃ.ən/"],
    ["burial", "n.", "埋葬；安葬", "/' ber. i.əl/"],
    ["honor/ honour", "v.", "尊重；表示敬意 n.荣幸；荣誉", "/'ɒn.ər/"],
    ["ancestor", "n.", "祖宗；祖先", "/'æn. ses.tər/"],
    ["victory", "n.", "胜利；成功", "/'vɪk.tər. i/"],
    ["enemy", "n.", "敌人；仇人", "/' en.ə. mi/"],
    ["period", "n.", "一段时间；时期；句号", "/'pɪə. ri.əd/"],
    ["noise", "n.", "声音；噪音", "/nɔɪz/"],
  ],
  'g9a-u9': [
    ["prefer", "v.", "更喜欢", "/prɪ'fɜːr/"],
    ["lyrics", "n.", "(pl.)歌词", "/'lɪr.ɪks/"],
    ["Australian", "adj.", "澳大利亚(人)的n.澳大利亚人", "/ɒs'treɪ. li.ən/"],
    ["electronic", "adj.", "电子的；电子设备的", "/ˌel.ɪk'trɒn.ɪk/"],
    ["suppose", "v.", "推断；料想", "/sə'pəʊz/"],
    ["smooth", "adj.", "悦耳的；平滑的", "/ smu:ð/"],
    ["spare", "adj.", "空闲的；不用的 v.抽出；留出", "/ spear/"],
    ["director", "n.", "导演；部门负责人", "/daɪ' rek.tər//dɪ' rek.tər/"],
    ["case", "n.", "情况；实情", "/keɪs/"],
    ["in that case", "adv. phr.", "既然那样；假使那样的话", "/ɪn/ /ðæt/ /keɪs/"],
    ["war", "n.", "战争；战争状态", "/wɔ:r/"],
    ["stick(stuck, stuck)", "v.", "粘贴；将……刺入", "/stɪk/ (/stʌk/)"],
    ["stick to", "v. phr.", "坚持; 固守", "/stɪk/ / tu:/"],
    ["down", "adj.", "悲哀; 沮丧", "/daʊn/"],
    ["dialog/ dialogue", "n.", "对话；对白", "/ˈdaɪ.ə. lɒɡ/"],
    ["ending", "n.", "(故事、电影等的)结尾；结局", "/' en. dɪŋ/"],
    ["documentary", "n.", "纪录片", "/ˌdɒk.jə' men.tər. i/"],
    ["drama", "n.", "戏; 剧", "/' drɑ:.mə/"],
    ["plenty", "pron.", "大量; 众多", "/' plen. ti/"],
    ["plenty of", "adj. phr.", "大量; 充足", "/' plen. ti/ /əv/"],
    ["shut (shut, shut)", "v.", "关闭；关上", "/ʃʌt/"],
    ["shut off", "v.", "关闭；停止运作", "/ʃʌt//ɒf/"],
    ["superhero", "n.", "超级英雄", "/' su:.pə,hɪə. rəʊ/"],
    ["once in a while", "adv. phr.", "偶尔地; 间或", "/,wʌn. sɪnə'laɪf. waɪl/"],
    ["intelligent", "adj.", "有才智的；聪明的", "/ɪn' tel.ɪ. dʒənt/"],
    ["sense", "v.", "感觉到；意识到 n.感觉；意识", "/ sens/"],
    ["sadness", "n.", "悲伤；悲痛", "/'sæd.nəs/"],
    ["pain", "n.", "痛苦；疼痛；苦恼", "/peɪn/"],
    ["reflect", "v.", "反映；映出", "/rɪ' flekt/"],
    ["moving", "adj.", "动人的；令人感动的", "/' mu:. vɪŋ/"],
    ["perform", "v.", "表演；执行", "/pə'fɔ:m/"],
    ["lifetime", "n.", "一生；有生之年", "/'laɪf. taɪm/"],
    ["by the end of", "adv. phr.", "在(某时间点)以前", "/baɪ//ði:// end//əv/"],
    ["pity", "n.", "遗憾；怜悯", "/'pɪt. i/"],
    ["total", "n.", "总数；合计 adj.总的；全体的", "/'təʊ.təl/"],
    ["in total", "adv. phr.", "总共; 合计", "/ɪn//'təʊ.təl/"],
    ["master", "n.", "大师；能手；主人 v.掌握", "/' ma:.stər/"],
    ["praise", "v.&n.", "表扬; 赞扬", "/preɪz/"],
    ["recall", "v.", "回忆起；回想起", "/rɪ'kɔ:l/"],
    ["wound", "n.", "伤；伤口；创伤v.使(身体)受伤；伤害", "/ wu: nd/"],
    ["painful", "adj.", "令人痛苦的；令人疼痛的", "/'peɪn.fəl/"],
  ],
  'g9a-u10': [
    ["bow", "v.&n.", "鞠躬", "/baʊ/"],
    ["kiss", "v.&n.", "亲吻; 接吻", "/kɪs/"],
    ["greet", "v.", "和……打招呼；迎接", "/ gri:t/"],
    ["relaxed", "adj.", "放松的；自在的", "/rɪ'lækst/"],
    ["value", "v.", "重视；珍视 n.价值", "/'væl. ju:/"],
    ["drop by", "v. phr.", "顺便访问", "/drɒp//baɪ/"],
    ["capital", "n.", "首都；国都", "/'kæp.ɪ.təl/"],
    ["after all", "adv.", "v毕竟; 终归", "/'ɑːf.tər/ /ɔ:l/"],
    ["noon", "n.", "正午；中午", "/ nu:n/"],
    ["mad", "adj.", "很生气；疯的", "/mæd/"],
    ["get mad", "v. phr.", "大动肝火; 气愤", "/ get//mæd/"],
    ["effort", "n.", "努力；尽力", "/' ef.ət/"],
    ["make an effort", "v. phr.", "作出努力", "/meɪk/ /ən//' ef.ət/"],
    ["passport", "n.", "护照", "/'pɑːs.pɔ:t/"],
    ["clean ... off", "v. phr.", "把……擦掉", "/ kli:n//ɒf/"],
    ["chalk", "n.", "粉笔", "/tʃɔ:k/"],
    ["blackboard", "n.", "黑板", "/'blæk.bɔ:d/"],
    ["northern", "adj.", "北方的；北部的", "/'nɔ:.ðən/"],
    ["coast", "n.", "海岸；海滨", "/kəʊst/"],
    ["season", "n.", "季；季节", "/' si:.zən/"],
    ["knock", "v.", "敲；击n.敲击声；敲击", "/nɒk/"],
    ["eastern", "adj.", "东方的；东部的", "/'i:.stən/"],
    ["take off", "v. phr.", "脱下(衣服); (飞机等)起飞", "/teɪk/ /ɒf/"],
    ["worth", "adj.", "值得; 有……价值(的)", "/wɜːθ/"],
    ["manner", "n.", "方式; 方法 (pl.)礼貌;礼仪", "/'mæn.ər/"],
    ["empty", "adj.", "空的；空洞的", "/' emp. ti/"],
    ["basic", "adj.", "基本的；基础的", "/'beɪ. sɪk/"],
    ["exchange", "n.&v.", "交换", "/ɪks'tʃeɪndʒ/"],
    ["go out of one's way", "v. phr.", "特地; 格外努力", "/gəʊ//aʊt//əv/ /wʌns/ /weɪ/"],
    ["make", "v. phr.", "使(某人)感到宾至如归 home", "/meɪk// fi:l/ /æt//həʊm/"],
    ["teenage", "adj.", "十几岁的；青少年的", "/' ti:n. eɪdʒ/"],
    ["granddaughter", "n.", "(外)孙女", "/'græn.dɔ:.tər/"],
    ["behave", "v.", "表现；举止", "/bɪ'heɪv/"],
    ["except", "prep.", "除……之外 conj.除了; 只是", "/ɪk' sept/"],
    ["elbow", "n.", "肘；胳膊", "/' el. bəʊ/"],
    ["gradually", "adv.", "逐步地；渐进地", "/'grædʒ. u.ə. li/"],
    ["get used to", "v. phr.", "习惯于", "/ get// ju: st/ / tu:/"],
    ["suggestion", "n.", "建议", "/sə'dʒes. tʃən/"],
  ],
};

const GRADE_G9B_UNIT_TITLES = ["Unit 11","Unit 12","Unit 13","Unit 14"];

const RAW_WORDS_G9B = {
  'g9b-u1': [
    ["rather", "adv.", "宁愿; 相当", "/'rɑː.ðər/"],
    ["would rather", "", "(通常缩写为' d rather)宁愿", "/wʊd//'rɑː.ðər/"],
    ["drive(drove,driven)", "v. phr.", "迫使", "/draɪv//drəʊv//'drɪv.ən/"],
    ["drive sb. crazy /mad", "v. phr.", "使人发疯/发狂", "/draɪv//'sʌm.bə. di//'kreɪ. zi//mæd/"],
    ["the more ... the more……", "", "越……越……;愈……愈……", "/ðə/ /mɔ:r//ðə//mɔ:r/"],
    ["lately", "adv.", "最近；不久前", "/'leɪt. li/"],
    ["be friends with sb.", "v.", "成为某人的朋友", "/ bi:/ / frendz/ /wɪð//'sʌm.bə. di/"],
    ["leave out", "v. phr.", "忽略;不提及;不包括", "/ li:v/ /aʊt/"],
    ["friendship", "n.", "友谊；友情", "/' frend.ʃɪp/"],
    ["king", "n.", "国王；君主", "/kɪŋ/"],
    ["prime", "adj.", "首要的；基本的", "/praɪm/"],
    ["minister", "n.", "大臣；部长", "/'mɪn.ɪ.stər/"],
    ["prime minister", "n. phr.", "首相; 总理", "/praɪm//'mɪn.ɪ.stər/"],
    ["banker", "n.", "银行家", "/'bæŋ.kər/"],
    ["fame", "n.", "名声；声誉", "/feɪm/"],
    ["pale", "n.", "苍白的；灰白的", "/peɪl/"],
    ["queen", "n.", "王后；女王", "/ kwi:n/"],
    ["call in", "v. phr.", "召来; 叫来", "/kɔ:l/ /ɪn/"],
    ["examine", "v.", "(仔细地)检查；检验", "/ɪg'zæm.ɪn/"],
    ["nor", "conj.& adv.", "也不", "/nɔ:r/"],
    ["neither …… nor……", "", "既不……也不……", "/'naɪ.ðər/ /' ni:.ðər//nɔ:r/"],
    ["palace", "n.", "王宫；宫殿", "/'pæl.ɪs/"],
    ["wealth", "n.", "财富", "/welθ/"],
    ["to start with", "phr.", "起初；开始时", "/ tu:// sta:t/ /wɪð/"],
    ["grey", "adj.", "(天空)阴沉；昏暗的；灰色的", "/greɪ/"],
    ["lemon", "n.", "柠檬", "/' lem.ən/"],
    ["uncomfortable", "adj.", "使人不舒服的；令人不舒适的", "/ʌn'kʌmf.tə.bəl/"],
    ["weight", "n.", "重量；分量", "/weɪt/"],
    ["shoulder", "n.", "肩；肩膀", "/'ʃəʊl.dər/"],
    ["goal", "n.", "射门；球门；目标", "/gəʊl/"],
    ["let ... down", "v. phr.", "使失望", "/ let//daʊn/"],
    ["coach", "n.", "教练；私人教师", "/kəʊtʃ/"],
    ["kick", "v.", "踢; 踹", "/kɪk/"],
    ["kick sb. off", "v. phr.", "开除某人", "/kɪk/ /'sʌm.bə. di//ɒf/"],
    ["be hard on sb.", "v. phr.", "对某人苛刻;对某人要求严厉", "/ bi:/ /hɑːd//ɒn//'sʌm.bə. di/"],
    ["besides", "adv.", "而且", "/bɪ'saɪdz/"],
    ["teammate", "n.", "同队队员；队友", "/' ti:m. meɪt/"],
    ["courage", "n.", "勇敢；勇气", "/'kʌr.ɪdʒ/"],
    ["rather than", "", "而不是", "/'rɑː.ðər/ /ðæn/"],
    ["guy", "n.", "(非正式)家伙; (pl. guys)伙计们", "/gaɪ/"],
    ["pull", "v.", "拉; 拖", "/pʊl/"],
    ["pull together", "v. phr.", "齐心协力；通力合作", "/pʊl/ /tə'geð.ər/"],
    ["relief", "n.", "轻松；解脱", "/rɪ' li:f/"],
    ["nod", "v.", "点头", "/nɒd/"],
    ["agreement", "n.", "(意见或看法)一致；同意", "/ə' gri:.mənt/"],
    ["fault", "n.", "过失；缺点", "/fɒlt/"],
    ["disappoint", "v.", "使失望", "/ˌdɪs.ə'pɔɪnt/"],
  ],
  'g9b-u2': [
    ["unexpected", "adj.", "出乎意料的；始料不及的", "/ˌʌn.ɪk' spek. tɪd/"],
    ["by the time…", "adv. phr.", "在……以前", "/baɪ/ /ðə/ /taɪm/"],
    ["backpack", "n.", "背包；旅行包", "/'bæk.pæk/"],
    ["oversleep", "v.", "睡过头；睡得太久 (overslept,overslept)", "/ˌəʊ.və' sli:p//ˌəʊ.və' slept/"],
    ["give ……a lift", "v. phr.", "捎……一程", "/gɪv/ /ə/ /lɪft/"],
    ["block", "n.", "街区", "/blɒk/"],
    ["in line with", "phr.", "与……成一排", "/ɪn/ /laɪn/ /wɪð/"],
    ["worker", "n.", "工作者；工人", "/'wɜː.kər/"],
    ["stare", "v.", "盯着看；凝视", "/steər/"],
    ["disbelief", "n.", "不信；怀疑", "/ˌdɪs. bɪ' li:f/"],
    ["above", "prep.", "在……上面 adv.在上面", "/ə'bʌv/"],
    ["burn(burnt,burnt;burned,burned)", "v.", "着火；燃烧", "/bɜ:n//bɜ: nt//bɜːnd/"],
    ["burning", "adj.", "着火的；燃烧的", "/'bɜː. nɪŋ/"],
    ["alive", "adj.", "活着；有生气的", "/ə'laɪv/"],
    ["airport", "n.", "机场", "/'eə.pɔ:t/"],
    ["till", "prep.& conj.", "到; 直到", "/tɪl/"],
    ["west", "adv.", "向西; 朝西adj.向西的;西部的 n.西；西方", "/ west/"],
    ["dead", "adj.", "死的；失去生命的", "/ ded/"],
    ["cream", "n.", "奶油；乳脂", "/ kri:m/"],
    ["workday", "n.", "工作日", "/'wɜːk. deɪ/"],
    ["show up", "v.", "赶到；露面", "/ʃəʊ/ /ʌp/"],
    ["bean", "n.", "豆；豆荚", "/ bi:n/"],
    ["market", "n.", "市场；集市", "/'mɑː. kɪt/"],
    ["fool", "n.", "蠢人；傻瓜 v.愚弄", "/ fu:l/"],
    ["costume", "n.", "(特定场合穿的)服装；装束", "/'kɒs. tʃu:m/"],
    ["embarrassed", "adj.", "窘迫的；害羞的", "/ɪm'bær.əst/"],
    ["costume party", "n. phr.", "化妆舞会", "/'kɒs. tʃu:m//'pɑː. ti/"],
    ["announce", "v.", "宣布；宣告", "/ə'naʊns/"],
    ["spaghetti", "n.", "意大利面条", "/spə' get. i/"],
    ["hoax", "n.", "骗局；恶作剧", "/həʊks/"],
    ["sell out", "v. phr.", "卖光", "/ sel/ /aʊt/"],
    ["discovery", "n.", "发现；发觉", "/dɪ'skʌv.ər. i/"],
    ["lady", "n.", "女士；女子", "/'leɪ. di/"],
    ["cancel", "v.", "取消；终止", "/'kæn.səl/"],
    ["officer", "n.", "军官；官员", "/'ɒf.ɪ.sər/"],
    ["believable", "adj.", "可相信的；可信任的", "/bɪ' li:.və.bəl/"],
    ["disappear", "v.", "消失；不见", "/ˌdɪs.ə'pɪər/"],
    ["embarrassing", "adj.", "使人害羞的(难堪的或惭愧的)", "/ɪm'bær.ə. sɪŋ/"],
  ],
  'g9b-u3': [
    ["litter", "v.", "乱扔 n.垃圾；废弃物", "/'lɪt.ər/"],
    ["fisherman", "n.", "渔民；钓鱼的人", "/'fɪʃ.ə.mən/"],
    ["coal", "n.", "煤；煤块", "/kəʊl/"],
    ["ugly", "adj.", "丑陋的；难看的", "/'ʌg. li/"],
    ["advantage", "n.", "优点；有利条件", "/əd'vɑ:n. tɪdʒ/"],
    ["cost (cost, cost)", "v.", "花费 n.花费；价钱", "/kɒst/"],
    ["wooden", "adj.", "木制的；木头的", "/'wʊd.ən/"],
    ["plastic", "adj.", "塑料的  n.塑料;塑胶", "/'plæs. tɪk/"],
    ["takeaway", "n.", "外卖食物", "/'teɪk.ə. weɪ/"],
    ["bin", "n.", "垃圾箱", "/bɪn/"],
    ["shark", "n.", "鲨鱼", "/ʃɑːk/"],
    ["fin", "n.", "(鱼)鳍", "/fɪn/"],
    ["cruel", "adj.", "残酷的；残忍的", "/' kru:.əl/"],
    ["harmful", "adj.", "有害的", "/'hɑ:m.fəl/"],
    ["be harmful to", "v. phr.", "对……有害", "/ bi://'hɑ:m.fəl// tu:/"],
    ["at the top of", "adv. phr.", "在……顶部或顶端", "/æt/ /ðə/ /tɒp/ /əv/"],
    ["chain", "n.", "链子；链条", "/tʃeɪn/"],
    ["the food chain", "n. phr.", "食物链", "/ðə/ /tʃeɪn/ / fu:d/"],
    ["ecosystem", "n.", "生态系统", "/'i:. kəʊˌsɪs.təm/"],
    ["industry", "n.", "工业；行业", "/'ɪn.də. stri/"],
    ["law", "n.", "法律；法规", "/lɔ:/"],
    ["scientific", "adj.", "科学上的；科学的", "/ˌsaɪ.ən'tɪf.ɪk/"],
    ["present", "adj.", "现在的 n.现在;礼物", "/' prez.ənt/"],
    ["take part in", "v. phr.", "参加", "/teɪk/ /pɑːt/ /ɪn/"],
    ["afford", "v.", "承担得起(后果)；买得起", "/ə'fɔ:d/"],
    ["turn off", "v. phr.", "关掉", "/tɜ:n/ /ɒf/"],
    ["reusable", "adj.", "可重复使用的；可再次使用的", "/ˌriː' ju:.zə.bəl/"],
    ["pay for", "v. phr.", "付费; 付出代价", "/peɪ/ /fər/"],
    ["take action", "v. phr.", "采取行动", "/teɪk//'æk.ʃən/"],
    ["transportation", "n.", "运输业；交通运输", "/ˌtræn.spɔ:'teɪ.ʃən/"],
    ["recycle", "n.", "回收利用；再利用", "/ˌri:'saɪ.kəl/"],
    ["napkin", "n.", "餐巾；餐巾纸", "/'næp. kɪn/"],
    ["throw away", "v.", "扔掉；抛弃", "/θrəʊ/ /ə'weɪ/"],
    ["put sth. to good use", "v. phr.", "好好利用某物", "/pʊt/ /'sʌm.θɪŋ// tu://gʊd/ / ju:s/"],
    ["put... down", "v. phr.", "拆下; 摧毁", "/pʊt/ /daʊn/"],
    ["upside down", "adv.", "v 上下颠倒;倒转", "/'ʌp. saɪd/ /daʊn/"],
    ["gate", "n.", "大门", "/geɪt/"],
    ["bottle", "n.", "瓶子", "/'bɒt.əl/"],
    ["president", "n.", "负责人；主席；总统", "/' prez.ɪ.dənt/"],
    ["inspiration", "n.", "灵感；鼓舞人心的人(或事物)", "/ˌɪn. spɪ'reɪ.ʃən/"],
    ["iron", "n.", "铁", "/aɪən/"],
    ["work", "n.", "(音乐、艺术)作品", "/wɜːk/"],
    ["metal", "n.", "金属", "/' met.əl/"],
    ["bring back", "v. phr.", "恢复; 使想起; 归还", "/brɪŋ/ /bæk/"],
    ["creativity", "n.", "创造力；独创性", "/ˌkri:. eɪ'tɪv.ə. ti/"],
  ],
  'g9b-u4': [
    ["survey", "n.", "调查", "/'sɜː. veɪ/"],
    ["standard", "n.", "标准；水平", "/'stæn.dəd/"],
    ["row", "n.", "一排；一列；一行", "/rəʊ/"],
    ["in a row", "phr.", "连续几次", "/ɪn/ /ə//rəʊ/"],
    ["keyboard", "n.", "键盘式电子乐器；键盘", "/' ki:.bɔ:d/"],
    ["method", "n.", "方法；措施", "/'meθ.əd/"],
    ["instruction", "n.", "指示；命令", "/ɪn'strʌk.ʃən/"],
    ["double", "v.", "加倍；是……的两倍adj.两倍的；加倍的", "/'dʌb.əl/"],
    ["shall", "", "modal v.将要; 将会", "/ʃæl/"],
    ["look back at", "v. phr.", "回首(往事); 回忆; 回顾", "/lʊk/ /bæk//æt/"],
    ["overcome(overcame,overcome)", "v.", "克服；战胜", "/ˌəʊ.və'kʌm//ˌəʊ.və'keɪm//ˌəʊ.və'kʌm/"],
    ["make a mess", "v. phr.", "弄得一团糟(一塌糊涂)", "/meɪk/ /ə/ / mes/"],
    ["graduate", "v.", "毕业；获得学位", "/'grædʒ. u.ət/"],
    ["keep one' s cool", "v. phr.", "沉住气;保持冷静", "/ ki:p/ /wʌns/ / ku:l/"],
    ["caring", "adj.", "体贴人的；关心他人的", "/'keə. rɪŋ/"],
    ["ours", "pron.", "我们的", "/aʊəz/"],
    ["senior", "adj.", "级别(或地位)高的", "/' si:. ni.ər/"],
    ["senior high(school)", "n. phr.", "高中", "/ˌsi:. ni.ə'haɪsku:l/"],
    ["text", "n.", "课文；文本", "/ tekst/"],
    ["go by", "v. phr.", "(时间)逝去; 过去", "/gəʊ/ /baɪ/"],
    ["level", "n.", "水平", "/' lev.əl/"],
    ["degree", "n.", "(大学)学位；度数；程度", "/dɪ' gri:/"],
    ["manager", "n.", "经理；经营者", "/'mæn.ɪ. dʒər/"],
    ["believe in", "v. phr.", "信任; 信赖", "/bɪ' li:v/ /ɪn/"],
    ["gentleman", "n.", "先生；绅士", "/'dʒen.təl.mən/"],
    ["graduation", "n.", "毕业", "/,grædʒ. u'eɪ.ʃən/"],
    ["ceremony", "n.", "典礼；仪式", "/' ser.ɪ.mə. ni/"],
    ["first of all", "adv. phr.", "首先", "/'fɜːst/ /əv/ /ɔ:l/"],
    ["congratulate", "v.", "祝贺", "/kən'grætʃ.ə. leɪt/"],
    ["thirsty", "adj.", "渴望的；口渴的", "/'θɜː. sti/"],
    ["be thirsty for", "v. phr.", "渴望; 渴求", "/ bi://'θɜː. sti/ /fər/"],
    ["thankful", "adj.", "感谢; 感激", "/'θæŋk.fəl/"],
    ["be thankful to sb.", "adj. phr.", "对某人心存感激", "/ bi://'θæŋk.fəl// tu:/ /fər/"],
    ["lastly", "adv.", "最后", "/'lɑ: st. li/"],
    ["task", "n.", "任务；工作", "/tɑːsk/"],
    ["ahead", "adv.", "向前面；在前面", "/ə' hed/"],
    ["ahead of", "adv. phr.", "在……前面", "/ə' hed ˌəv/"],
    ["along with", "adv. phr.", "连同; 除……以外还", "/ə'lɒŋ/ /wɪð/"],
    ["responsible", "adj.", "有责任心的", "/rɪ'spɒn.sə.bəl/"],
    ["be responsible for", "v. phr.", "对……有责任; 负责任", "/ bi://rɪ'spɒn.sə.bəl//fər/"],
    ["separate", "adj.", "单独的；分离的 v.分开；分离", "/' sep.ər.ət/"],
    ["set out", "v. phr.", "出发; 启程", "/ set/ /aʊt/"],
    ["separate from", "v. phr.", "分离; 隔开", "/' sep.ər.ət/ /frɒm/"],
    ["wing", "n.", "翅膀；翼", "/wɪŋ/"],
  ],
};

/* 单元：七年级上册与小学来自教材 Excel；其他学年预留空框架，家长可通过
 * 词库管理的“导入词库文件”按钮导入 Excel 或手动添加。 */
const RAW_UNITS = {
  gPri: GRADE_PRI_UNIT_TITLES,
  g7a: GRADE_G7A_UNIT_TITLES,
  g7b: GRADE_G7B_UNIT_TITLES,
  g8a: GRADE_G8A_UNIT_TITLES,
  g8b: GRADE_G8B_UNIT_TITLES,
  g9a: GRADE_G9A_UNIT_TITLES,
  g9b: GRADE_G9B_UNIT_TITLES,
};

/* 单词：[text, pos, meaning, phon(音标)]
 * 七年级上册 318 词、小学 396 词来自教材单词表 Excel，全部带音标；
 * 七下 493 / 八上 415 / 八下 474 / 九上 426 / 九下 174 词来自
 * 《2025新人教版初中英语词汇表.docx》解析（七下以权威版 docx 为底本合并），
 * 由 gen-wordlib-from-json.js 生成，勿手改。
 * 例句(example)为可选字段，家长可在词库维护中补充。 */
const RAW_WORDS = Object.assign({}, RAW_WORDS_PRI, RAW_WORDS_G7A, RAW_WORDS_G7B, RAW_WORDS_G8A, RAW_WORDS_G8B, RAW_WORDS_G9A, RAW_WORDS_G9B);




/* 10.9 默认奖励 */
const DEFAULT_REWARDS = [
  { id: 'r1', name: '周末游戏时间 +30分钟', points: 200, limitWeek: 1, limitMonth: 4, note: '由家长确认后生效' },
  { id: 'r2', name: '周末游戏时间 +1小时', points: 350, limitWeek: 1, limitMonth: 2, note: '由家长确认后生效' },
  { id: 'r3', name: '周末观影时间 +1小时', points: 300, limitWeek: 1, limitMonth: 3, note: '由家长确认后生效' },
  { id: 'r4', name: '自选小零食', points: 150, limitWeek: 2, limitMonth: 6, note: '由家长确认后生效' },
  { id: 'r5', name: '周末晚睡 30分钟', points: 250, limitWeek: 1, limitMonth: 3, note: '由家长确认后生效' },
  { id: 'r6', name: '和朋友出去玩 1小时', points: 500, limitWeek: 1, limitMonth: 2, note: '由家长确认后生效' },
];

/* 5.4 内置文章：主题短文，words 列出文章覆盖的目标词（需与词库 text
 * 一致，匹配时忽略大小写）。选篇时按“当日新词覆盖率”挑选，与单元无绑定，
 * 词库更换后仍可按词面命中；无命中时由 generateArticle 兜底生成。 */
const BUILT_IN_ARTICLES = [
  {
    id: 'a1',
    title: 'My Day at School',
    text: 'I get up at six thirty in the morning. After breakfast, I go to school with my brother. Our classroom is big and bright. The teacher writes on the blackboard, and we read after her. I have a pen, a pencil and a ruler in my bag. At twelve, we eat lunch at school. In the afternoon, we have PE class on the playground. In the evening, I do my homework and then read a book. What a happy day!',
    words: ['school', 'morning', 'breakfast', 'classroom', 'teacher', 'blackboard', 'pen', 'pencil', 'ruler', 'bag', 'lunch', 'afternoon', 'evening', 'book'],
  },
  {
    id: 'a2',
    title: 'My Family',
    text: 'There are four people in my family: my father, my mother, my sister and I. My father is a doctor and my mother is a teacher. My sister is ten years old. She is a student, too. These are our photos. Who is the girl in red? She is my best friend. I love my family very much.',
    words: ['family', 'people', 'father', 'mother', 'sister', 'student', 'these', 'friend', 'love', 'year'],
  },
  {
    id: 'a3',
    title: 'Food and Health',
    text: 'To stay healthy, I eat vegetables and fruit every day. I have an apple and some bread for breakfast, rice and chicken for lunch, and fish for dinner. I drink milk and water, but not cola. After school, I play basketball with my friends. Doing sports is my favorite way to have fun. Good food and exercise make me strong.',
    words: ['healthy', 'vegetable', 'apple', 'bread', 'breakfast', 'rice', 'chicken', 'lunch', 'fish', 'dinner', 'milk', 'water', 'basketball', 'friend', 'favorite', 'fun'],
  },
  {
    id: 'a4',
    title: 'Shopping for Colorful Things',
    text: 'On Sunday, Mom and I go to the store near our home. I want to buy a schoolbag. There are many colors: red, blue, green, yellow, white and black. A red one looks nice, but the price is a little high. The blue one is cheap, so Mom buys it for me. I save my pocket money too, because I want to buy a dictionary next month.',
    words: ['store', 'buy', 'color', 'red', 'blue', 'green', 'yellow', 'white', 'black', 'price', 'cheap', 'money', 'dictionary', 'school'],
  },
  {
    id: 'a5',
    title: 'Seasons and Weather',
    text: 'There are four seasons in a year. Spring is warm, and flowers come out. Summer is hot, and we often swim in the river. Autumn is cool and dry; it is the best season to fly kites. Winter is cold, and it often snows. The snow is white and clean. Windy days are common in autumn here. What is the weather like in your city?',
    words: ['season', 'year', 'spring', 'summer', 'autumn', 'winter', 'warm', 'hot', 'cool', 'cold', 'snow', 'white', 'weather', 'sunny'],
  },
  {
    id: 'a6',
    title: 'A Letter to a Friend',
    text: 'Dear Anna, how are you? I am happy to write to you. I want to tell you about my new school life. The students here are friendly, and we often talk and play together after class. When I have questions, I ask the teachers, and they always help me. Please call me when you are free. I hope we can meet soon. Welcome to visit my home! Yours, Lily',
    words: ['happy', 'tell', 'student', 'talk', 'together', 'question', 'ask', 'answer', 'help', 'call', 'meet', 'visit', 'welcome'],
  },
  {
    id: 'a7',
    title: 'My Week of Learning English',
    units: ['gPri-u1', 'gPri-u2', 'gPri-u3', 'gPri-u4', 'gPri-u5', 'gPri-u6', 'gPri-u7', 'gPri-u8'],
    weekly: true,
    text: 'This week I learned many new English words. On Monday, I learned the words about my family, like father, mother, sister and brother. On Tuesday, the words were about school: classroom, desk, teacher and student. On Wednesday, I learned about time: morning, afternoon and evening. On Thursday, the words were about food, such as rice, bread and vegetables. On Friday, I learned the words of sports and music. I like basketball best. On Saturday, I read a long story about seasons and weather. Spring is warm and winter is cold. On Sunday morning, I went shopping with my mother. We bought bread, milk and apples. Learning English is interesting. I speak English with my friends, and we help each other. I love English!',
    words: ['week', 'family', 'father', 'mother', 'sister', 'brother', 'school', 'classroom', 'teacher', 'student', 'time', 'morning', 'afternoon', 'evening', 'food', 'rice', 'bread', 'vegetable', 'sport', 'music', 'basketball', 'season', 'weather', 'spring', 'winter', 'shopping', 'milk', 'apple', 'interesting', 'speak', 'friend', 'help', 'love'],
  },
];

/* ======================================================
 * 2. 工具函数
 * ====================================================== */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function uid(prefix) {
  return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* 10.6 dateKey：本地日期字符串 YYYY-MM-DD */
function dateKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function todayKey() { return dateKey(new Date()); }

/* dateKey + n 天（本地日历计算，跨月/跨年正确） */
function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt);
}

/* dateKey 字符串比较即可判断先后（YYYY-MM-DD 格式保证字典序 = 时间序） */
function keyLE(a, b) { return a <= b; }

/* 7.2 间隔公式：round(2.2^reps)；
 * learning 封顶 30 天，mastered 封顶 90 天 */
function nextInterval(reps, status) {
  const raw = Math.round(Math.pow(2.2, reps));
  const cap = status === 'mastered' ? 90 : 30;
  return Math.max(1, Math.min(raw, cap));
}

/* ======================================================
 * 3. 数据存储（10.1 / 12.3）
 * ====================================================== */

const STORE_KEY = 'seven-a-english-v1';
const HISTORY_LIMIT = 5000;
/* 词库版本：内置词库整体更换时 +1，normalizeState 据此判断是否用
 * 新种子库替换旧数据中的词库（旧版 1 = 120 词种子库） */
const LIB_VERSION = 3;

function buildBaseState() {
  const units = [];
  const words = [];
  GRADES.forEach(g => {
    (RAW_UNITS[g.id] || []).forEach((title, i) => {
      const unitId = g.id + '-u' + (i + 1);
      units.push({ id: unitId, gradeId: g.id, title });
      (RAW_WORDS[unitId] || []).forEach((w, wi) => {
        words.push({
          id: unitId + '-' + (wi + 1),
          text: w[0], pos: w[1], meaning: w[2],
          phon: w[3] || '', example: w[4] || '',
          unitId, enabled: true,
        });
      });
    });
  });
  return {
    version: 2,
    libVersion: LIB_VERSION,
    grades: JSON.parse(JSON.stringify(GRADES)),
    units, words,
    users: [makeUser('user-1', '学生一'), makeUser('user-2', '学生二')],
    rewards: JSON.parse(JSON.stringify(DEFAULT_REWARDS)),
    settings: { parentPassword: '1234' },
    activeUser: 0,
  };
}

/* 每日新词硬上限：产品决策为每天最多 10 个新词（5.1），家长不可调高 */
const DAILY_NEW_MAX = 10;

function makeUser(id, name) {
  return {
    id, name,
    scopeGrades: ['gPri', 'g7a'],
    scopeUnits: [],
    dailyNew: DAILY_NEW_MAX,
    reviewLimit: 40,
    points: 0,
    wordStates: {},
    history: [],
    redemptions: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return buildBaseState();
    const s = JSON.parse(raw);
    return normalizeState(s);
  } catch (e) {
    console.error('读取本地数据失败，使用初始数据', e);
    return buildBaseState();
  }
}

/* 13. 导入/读取时补齐缺失字段与内置基础词库 */
function normalizeState(s) {
  const base = buildBaseState();
  /* 词库版本标记：种子词库整体更换（120 词旧版 → Excel 教材词库）时，
   * 用新版内置词库整体替换旧词库，并清理学生进度中指向已不存在单词的状态 */
  if (s.libVersion !== LIB_VERSION) {
    s.grades = base.grades;
    s.units = base.units;
    s.words = base.words;
    s.libVersion = LIB_VERSION;
    _grammarTextCache = null; /* 词库整体更换：易混词语法缓存失效（7.4.1） */
    (s.users || []).forEach(u => {
      if (u.wordStates) {
        const alive = {};
        s.words.forEach(w => { if (u.wordStates[w.id]) alive[w.id] = u.wordStates[w.id]; });
        u.wordStates = alive;
      }
    });
  }
  if (!Array.isArray(s.grades) || !s.grades.length) s.grades = base.grades;
  /* 13. 导入时补齐内置基础词库（units/words 为空时回填） */
  if (!Array.isArray(s.units) || !s.units.length) s.units = base.units;
  if (!Array.isArray(s.words) || !s.words.length) s.words = base.words;
  if (!Array.isArray(s.rewards) || !s.rewards.length) s.rewards = base.rewards;
  if (!Array.isArray(s.users) || !s.users.length) s.users = base.users;
  if (!s.settings || typeof s.settings !== 'object') s.settings = {};
  if (!s.settings.parentPassword) s.settings.parentPassword = '1234';
  if (typeof s.activeUser !== 'number' || s.activeUser < 0 || s.activeUser >= s.users.length) s.activeUser = 0;
  if (typeof s.version !== 'number') s.version = 2;
  s.users.forEach(u => {
    if (!Array.isArray(u.scopeGrades)) u.scopeGrades = ['gPri', 'g7a'];
    /* 学年范围过滤：只保留当前学年框架中存在的 id */
    const gradeIds = new Set(s.grades.map(g => g.id));
    u.scopeGrades = u.scopeGrades.filter(g => gradeIds.has(g));
    if (!u.scopeGrades.length) u.scopeGrades = ['g7a'];
    if (!Array.isArray(u.scopeUnits)) u.scopeUnits = [];
    if (typeof u.dailyNew !== 'number' || u.dailyNew < 1) u.dailyNew = DAILY_NEW_MAX;
    if (u.dailyNew > DAILY_NEW_MAX) u.dailyNew = DAILY_NEW_MAX; /* 每天最多 10 个新词 */
    if (typeof u.reviewLimit !== 'number' || u.reviewLimit < 0) u.reviewLimit = 40;
    if (typeof u.points !== 'number') u.points = 0;
    if (!u.wordStates || typeof u.wordStates !== 'object') u.wordStates = {};
    if (!Array.isArray(u.history)) u.history = [];
    if (!Array.isArray(u.redemptions)) u.redemptions = [];
    /* 旧版本数据没有任务快照字段：保持缺失（首次 buildDailyTask 会生成）；
     * 若存在但结构损坏则丢弃 */
    if (u.dailyTaskSnapshot && (typeof u.dailyTaskSnapshot !== 'object' ||
        typeof u.dailyTaskSnapshot.dateKey !== 'string' ||
        !Array.isArray(u.dailyTaskSnapshot.newIds) || !Array.isArray(u.dailyTaskSnapshot.reviewIds))) {
      delete u.dailyTaskSnapshot;
    }
  });
  return s;
}

let state = null;
let _grammarTextCache = null; /* 7.4.1 词库清洗文本缓存（易混词语法表用，词库变更时置空） */

function saveState() {
  if (typeof localStorage === 'undefined') return; /* Node 测试环境 */
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存数据失败', e);
    if (typeof alert === 'function') {
      alert('保存数据失败：本地存储空间可能已满，请导出备份后清理浏览器数据。');
    }
  }
}

function currentUser() { return state.users[state.activeUser]; }

/* ======================================================
 * 4. 学习事件与积分（10.7 / 8.1）
 * ====================================================== */

function logEvent(kind, wordId, opts) {
  const u = currentUser();
  const o = opts || {};
  const ev = {
    id: uid('event'),
    ts: Date.now(),
    dateKey: todayKey(),
    kind, wordId: wordId || null,
    points: o.points || 0,
    correct: o.correct == null ? null : o.correct,
    answer: o.answer == null ? null : o.answer,
    score: o.score == null ? null : o.score,
  };
  u.history.push(ev);
  /* 12.3 性能：事件保留最近 5000 条 */
  if (u.history.length > HISTORY_LIMIT) {
    u.history = u.history.slice(-HISTORY_LIMIT);
  }
  if (ev.points) u.points += ev.points;
  saveState();
  return ev;
}

/* 8.1 同一单词同一天同题型首次答对计分 */
function alreadyRewardedToday(wordId, kind) {
  const u = currentUser();
  const tk = todayKey();
  return u.history.some(ev => ev.dateKey === tk && ev.wordId === wordId &&
    ev.kind === kind && ev.correct === true && ev.points > 0);
}

/* ======================================================
 * 5. 间隔复习状态机（7.2 / 7.2.1）
 * ====================================================== */

function getWordState(wordId) {
  const u = currentUser();
  if (!u.wordStates[wordId]) u.wordStates[wordId] = newWordState();
  return u.wordStates[wordId];
}

function newWordState() {
  return {
    interval: 1,
    due: null,          /* 学习/评估发生当天才写入 */
    reps: 0,
    lapses: 0,
    lastReviewed: null,
    status: 'learning',
    followReadScore: null,
    followReadAttempts: 0,
    followReadAt: null,
    followReadTranscript: null,
  };
}

/* 按天迁移：当天三题（认读/拼写/听写）全对 = 成功，任一错 = 失败。
 * 每个词当天只调用一次（首次记录结果时）。 */
function applyDayResult(wordId, allCorrect) {
  const ws = getWordState(wordId);
  const tk = todayKey();
  ws.lastReviewed = tk;

  if (allCorrect) {
    ws.reps += 1;
    /* 7.2.1：weak 成功 → learning，从 1 重新累计；
     * learning 连续 3 次成功 → mastered；mastered 成功保持 */
    if (ws.status === 'weak') ws.status = 'learning';
    if (ws.status !== 'mastered' && ws.reps >= 3) ws.status = 'mastered';
    ws.interval = nextInterval(ws.reps, ws.status);
    ws.due = addDays(tk, ws.interval);
  } else {
    ws.reps = 0;
    ws.interval = 1;
    ws.due = addDays(tk, 1);
    ws.lapses += 1;
    ws.status = 'weak'; /* 7.2.1：mastered 失败同样撤销标记进入 weak */
  }
  saveState();
  return ws;
}

/* ======================================================
 * 6. 每日任务生成（7.1）
 * ====================================================== */

function wordMap() {
  const m = {};
  state.words.forEach(w => { m[w.id] = w; });
  return m;
}

/* 学生勾选范围：先按学年，学年下再按单元细分 */
function scopeWordIds(u) {
  const unitIds = new Set();
  state.units.forEach(un => {
    if (!u.scopeGrades.includes(un.gradeId)) return;
    if (u.scopeUnits.length && !u.scopeUnits.includes(un.id)) return;
    unitIds.add(un.id);
  });
  return state.words.filter(w => w.enabled && unitIds.has(w.unitId)).map(w => w.id);
}

/* 每日任务生成（7.1）。
 * 关键约束：**当天新词集一经生成即固定**——中途退出再点"开始学习"继续同一批
 * 新词，不会重新抽（否则同一天可无限学新词）。复习队列则是动态的：
 * 每次重算（新到期的词随时进入复习），但当天已学过的词不会混入。
 * 实现：新词集持久化为用户级快照（dailyTaskSnapshot.newIds），当天复用；
 * 复习队列每次实时计算。 */
function buildDailyTask(u) {
  const tk = todayKey();
  const inScope = scopeWordIds(u);
  const scopeSet = new Set(inScope);

  /* 快照兜底：旧版本/快照损坏时，用"今天学过"的 learn 事件还原当天新词集 */
  const learnedTodaySet = new Set();
  u.history.forEach(ev => {
    if (ev.dateKey === tk && ev.kind === 'learn' && ev.wordId && scopeSet.has(ev.wordId)) learnedTodaySet.add(ev.wordId);
  });

  /* 新词集：当天快照有效则直接用；否则重新生成并写入快照 */
  let snap = u.dailyTaskSnapshot;
  let newIds = null;
  if (snap && snap.dateKey === tk && Array.isArray(snap.newIds) &&
      snap.newIds.every(id => scopeSet.has(id))) {
    newIds = snap.newIds;
    /* 快照没记录到的今天 learn 事件（多设备/旧版数据）并入快照 */
    if (learnedTodaySet.size) {
      const merged = new Set(newIds.concat(Array.from(learnedTodaySet)));
      newIds = Array.from(merged);
      u.dailyTaskSnapshot = { dateKey: tk, newIds };
    }
  } else {
    const startedToday = inScope.filter(id => learnedTodaySet.has(id));
    /* 新词候选：范围内、无学习进度、今天还没碰过 */
    const fresh = inScope.filter(id => {
      if (learnedTodaySet.has(id)) return false;
      const ws = u.wordStates[id];
      return !ws || ws.lastReviewed == null;
    });
    const remainQuota = Math.max(0, u.dailyNew - startedToday.length);
    newIds = startedToday.concat(shuffle(fresh).slice(0, remainQuota));
    u.dailyTaskSnapshot = { dateKey: tk, newIds };
  }
  saveState();

  /* 复习队列：每次实时计算（due ≤ 今天且已有进度），排除当天已学的新词 */
  const newSet = new Set(newIds);
  const reviewIds = inScope.filter(id => {
    if (newSet.has(id)) return false;
    const ws = u.wordStates[id];
    return ws && ws.due && keyLE(ws.due, tk) && ws.lastReviewed != null;
  }).sort((a, b) => (u.wordStates[a].due < u.wordStates[b].due ? -1 : 1))
    .slice(0, u.reviewLimit);

  return { newIds, reviewIds, dateKey: tk };
}

/* ======================================================
 * 7. 语音朗读与跟读（5.2 / 7.4）
 * ====================================================== */

/* 朗读引擎链：系统 TTS → 在线语音（有道读音）→ 双失败则页面内提示并放行回调。
 * 设计要点（针对无 GMS 的华为平板/华为浏览器）：
 * 1) 安卓系浏览器的 speechSynthesis 大多绑定谷歌 TTS 组件，无 GMS 设备上
 *    speak() 静默无效（不报错、不发声、onend 不触发）——用 2.4s 启动看门狗
 *    探测，超时转在线语音；判定按会话缓存（netTTS），避免每次都等；
 * 2) 在线语音用 <audio> 播有道读音（国内可达、免密钥、无 CORS 限制），
 *    长文本自动按句分段顺序播；**单段失败跳过续播**，绝不整链判死——
 *    v1.0.2 曾把一次网络失败当成永久不可用，导致阅读页"点击无声音"；
 * 3) 失败提示是页面内常驻状态条（语音状态栏），不再弹 alert；
 * 4) 无论哪条路，onEnd 保证恰好触发一次，跟读流程不卡死。 */

let voicesCache = null;
let netTTS = false;         /* 系统 TTS 已判死：本会话直接走在线语音 */
let netTTSAudio = null;     /* 在线语音当前 <audio>，新朗读开始时截断 */
let netTTSToken = 0;        /* 在线语音分句链代际号：旧链不再续播 */
let speakDeferTimer = null; /* Android cancel→speak 竞态的延迟入队定时器 */
let speakToken = 0;         /* 朗读代际号：新朗读开始后，旧朗读的一切收尾作废 */
let ttsStatus = { mode: 'idle', lastError: null }; /* 诊断面板数据源 */

/* 语音事件日志（设备端观测）：朗读/跟读/模型链路每一步带时间戳留痕，
 * 诊断面板展示最近 30 条，可复制发维护者。静态分析到不了的地方，
 * 用设备上的事实说话（华为浏览器音频行为无文档，只能这么测）。 */
const voiceLog = [];
function vlog(msg) {
  const ts = new Date();
  const pad = n => String(n).padStart(2, '0');
  voiceLog.push('[' + pad(ts.getHours()) + ':' + pad(ts.getMinutes()) + ':' + pad(ts.getSeconds()) + '] ' + msg);
  if (voiceLog.length > 30) voiceLog.shift();
  try { console.log('[vlog] ' + msg); } catch (e) {}
}
/* 拿 Audio.play() 被拒绝的原因（NotAllowedError=自动播放限制 / 网络 / 其他） */
function describePlayError(err) {
  if (!err) return '未知';
  if (err.name === 'NotAllowedError') return '被浏览器拒绝（自动播放限制）';
  if (err.name === 'NotSupportedError') return '格式不支持或网络不可达';
  if (err.name === 'AbortError') return '被新朗读打断';
  return (err.name || 'Error') + (err.message ? ': ' + err.message : '');
}

function pickVoice() {
  if (!('speechSynthesis' in global)) return null;
  if (!voicesCache) {
    const list = global.speechSynthesis.getVoices();
    voicesCache = list && list.length ? list : null; /* 空表保持 null，下次再探 */
  }
  return voicesCache ? (voicesCache.find(v => /^en(-|_)/i.test(v.lang)) || null) : null;
}

if ('speechSynthesis' in global) {
  global.speechSynthesis.onvoiceschanged = () => { voicesCache = null; pickVoice(); };
}

/* 语音状态栏：学习页/阅读页底部的常驻提示（诊断面板同源）。
 * mode: 'idle' | 'sys' | 'online' | 'error' */
function setTTSStatus(mode, err) {
  ttsStatus.mode = mode;
  ttsStatus.lastError = err || null;
  if (typeof document === 'undefined') return; /* Node 测试环境 */
  const bar = $('#tts-status');
  if (!bar) return;
  const wa = typeof global.WordAudio !== 'undefined' ? global.WordAudio : null;
  const packInfo = wa && wa.status ? wa.status : null;
  const M = {
    idle: ['', ''],
    sys: ['语音引擎：本地音频', ''],    online: ['语音引擎：在线发音（联网）', ''],
    /* error 文案按音频包状态分类：装了 → 纯网络问题；没装 → 引导下载 */
    error: ['朗读暂不可用', packInfo && packInfo.count > 0
      ? '系统无 TTS 引擎，在线发音也失败（网络不通）。已装的离线发音包覆盖单词与阅读文章；其他句子仍需网络。'
      : '系统无 TTS 引擎，在线发音失败（网络不通）。建议在家长区 → 离线发音 下载离线发音包（约 21MB，一次安装永久离线覆盖全部单词与阅读文章）。'],
    /* 词卡场景专属：音频包未装/未命中 + 在线也不通（典型：飞行模式） */
    offline: ['朗读暂不可用（离线）', '离线发音包尚未安装，当前又无网络。联网后在家长区 → 离线发音 下载（约 21MB，一次安装永久离线）。'],
  }[mode] || ['', ''];
  if (!M[0]) { bar.classList.add('hidden'); bar.textContent = ''; return; }
  bar.classList.remove('hidden');
  bar.textContent = M[0] + (M[1] ? ' — ' + M[1] : '');
}

/* 在线语音按句分段：接口对超长输入会截断，≤200 字符一段顺序播放 */
function splitForTTS(text) {
  const src = String(text);
  if (src.length <= 200) return [src];
  const parts = [];
  let rest = src;
  while (rest.length) {
    if (rest.length <= 200) { parts.push(rest); break; }
    let cut = -1;
    ['. ', '? ', '! ', '; ', '.'].forEach(m => {
      const i = rest.lastIndexOf(m, 200);
      if (i > cut) cut = i;
    });
    if (cut < 20) cut = 199; /* 附近找不到断句符号就硬切 */
    parts.push(rest.slice(0, cut + 1));
    rest = rest.slice(cut + 1);
  }
  return parts;
}

function speakOnline(text, onEnd) {
  if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; }
  const token = ++netTTSToken;
  const parts = splitForTTS(text);
  let i = 0;
  let failures = 0;
  setTTSStatus('online');
  vlog('在线发音开始（' + parts.length + ' 段，' + String(text).slice(0, 20) + '）');
  const playNext = () => {
    if (token !== netTTSToken) { vlog('在线发音链被截断（token 失配，多半是新朗读/切词）'); return; }
    if (i >= parts.length) {
      /* 全部播完（允许个别段失败跳过）：本次朗读成功，不清 netTTS 判定 */
      if (failures > 0) {
        vlog('在线发音结束（' + failures + '/' + parts.length + ' 段失败）');
        setTTSStatus('error', '在线发音 ' + failures + '/' + parts.length + ' 段失败');
      } else {
        vlog('在线发音结束（全部段成功）');
      }
      if (onEnd) onEnd();
      return;
    }
    let a;
    const seg = String(parts[i]).slice(0, 15);
    try {
      a = new Audio('https://dict.youdao.com/dictvoice?type=0&audio=' + encodeURIComponent(parts[i++]));
    } catch (e) {
      /* 单段失败：跳过续播。注意必须让事件循环喘口气——Audio 构造器抛错时
       * 同步递归会无限循环卡死页面（华为浏览器音频组件异常时的真实形态） */
      vlog('Audio 构造失败：' + (e && e.message));
      failures++;
      setTimeout(playNext, 0);
      return;
    }
    netTTSAudio = a;
    const guard = setTimeout(() => {
      try { a.pause(); } catch (e) {}
      a.onerror = null; a.onended = null;
      vlog('第 ' + i + ' 段超时（7s 无进展，网络不通的典型形态）: "' + seg + '"');
      failures++; playNext();
    }, 7000);
    a.onended = () => { clearTimeout(guard); vlog('第 ' + i + ' 段播完: "' + seg + '"'); playNext(); };
    a.onerror = () => { clearTimeout(guard); vlog('第 ' + i + ' 段音频错误: "' + seg + '"'); failures++; playNext(); };
    a.play().then(
      () => vlog('第 ' + i + ' 段 play() 成功: "' + seg + '"'),
      err => { vlog('第 ' + i + ' 段 play() 被拒：' + describePlayError(err)); clearTimeout(guard); failures++; playNext(); }
    );
  };
  playNext();
}

/* 离线单词音频优先：当前会话有活跃词条时（学习卡/跟读链路），先用本地音频包
 * 播放词头发音（amy 音色，IndexedDB 离线）。未安装/未命中回退 speak 原链路。
 * currentSpeakWord 由 renderLearnCard 等设置——只有"词卡场景"走音频包，
 * 句子/文章朗读（text 不等于词面）直接走原链路。 */
let currentSpeakWord = null;

function speak(text, onEnd) {
  if (!text) { if (onEnd) onEnd(); return; }

  /* 词卡场景 + 音频包已装：本地播放（零网络，离线可用）。
   * status.installed 为初始 false 时也尝试播放（页面刚加载、refreshStatus
   * 还没回来；playWord 内部查 IndexedDB，miss 时返回 'miss' 走回退——
   * 飞行模式下状态未刷新曾导致已装的音频包被绕过，误报"语音不可用"） */
  const wa = typeof global.WordAudio !== 'undefined' ? global.WordAudio : null;
  const isWordCard = currentSpeakWord && currentSpeakWord.id &&
    String(text).toLowerCase() === String(currentSpeakWord.text).toLowerCase();
  if (wa && isWordCard && wa.playWord) {
    const myToken = ++speakToken;
    if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; netTTSToken++; }
    setTTSStatus('sys');
    vlog('本地音频包播放（word=' + currentSpeakWord.text + '）');
    wa.playWord(currentSpeakWord.id).then(how => {
      if (myToken !== speakToken) { vlog('本地音频被新朗读打断'); return; }
      if (how === 'played') { vlog('本地音频播放完成'); if (onEnd) onEnd(); return; }
      /* miss/err → 回退原链路。miss 时诊断关键信息：
       * 包到底装没装（status.count > 0 = 装了但缺这个词；0 = 没装过） */
      const installed = wa.status && wa.status.count > 0;
      vlog('本地音频未命中（' + how + '，包' + (installed
        ? '已装 ' + wa.status.count + ' 词但缺这个词'
        : '未安装（0 词）——需在家长区下载') + '），回退原链路');
      if (!installed) setTTSStatus('offline');
      speakFallback(text, onEnd);
    });
    return;
  }

  speakFallback(text, onEnd);
}

/* 文章朗读（阶段 4 离线句子层）：
 * audio 是 pickDailyArticle/pickWeeklyArticle 返回的拼接描述——
 * builtin: 音频包里有整篇（article:aN）；generated: 开头/前缀后缀/结尾
 * 模板 + 单词音频拼接。包未装/未命中 → 回退通用朗读链。
 * 正文 text 仅用于回退与日志。 */
function speakArticle(article, text, onEnd) {
  const wa = typeof global.WordAudio !== 'undefined' ? global.WordAudio : null;
  const a = article && article.audio;
  if (!wa || !a) { speak(text, onEnd); return; }

  const myToken = ++speakToken;
  if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; netTTSToken++; }
  setTTSStatus('sys');
  vlog('文章离线朗读开始（' + a.kind + (a.id ? ':' + a.id : '') + '）');

  const p = a.kind === 'builtin'
    ? wa.playArticle(a.id)
    : wa.playGeneratedArticle(a.ga.openIdx, a.ga.wordIds, a.ga.wordTmplIdxs, a.ga.closeIdx);

  p.then(how => {
    if (myToken !== speakToken) { vlog('文章离线朗读被打断'); return; }
    if (how === 'played') { vlog('文章离线朗读完成'); if (onEnd) onEnd(); return; }
    vlog('文章离线未命中（' + how + '，包' + (wa.status && wa.status.count > 0
      ? '已装但缺文章条目' : '未安装') + '），回退原链路');
    if (!wa.status || !wa.status.count) setTTSStatus('offline');
    speak(text, onEnd);
  }).catch(() => {
    if (myToken !== speakToken) return;
    speak(text, onEnd);
  });
}

function speakFallback(text, onEnd) {
  /* 新朗读开始：截断仍在播的在线语音（防止与本次朗读混音） */
  if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; netTTSToken++; }

  const myToken = ++speakToken;
  let done = false;
  const end = () => { if (!done && myToken === speakToken) { done = true; if (onEnd) onEnd(); } };
  const online = () => speakOnline(text, end);

  if (netTTS) { online(); return; }
  if (!('speechSynthesis' in global)) { netTTS = true; online(); return; }

  const synth = global.speechSynthesis;
  let u = null;
  let watchdog = null;
  let deadline = null;
  const stopGuards = () => {
    if (watchdog) { clearInterval(watchdog); watchdog = null; }
    if (deadline) { clearTimeout(deadline); deadline = null; }
  };

  /* 判定系统 TTS 不可用：先摘掉事件再 cancel（cancel 触发的 onend 会抢先
   * 消耗 end，导致跟读在在线示范音还没播完时就开录），然后转在线语音 */
  const giveUp = () => {
    if (myToken !== speakToken) { stopGuards(); return; }
    stopGuards();
    netTTS = true;
    try { if (u) { u.onend = null; u.onerror = null; } } catch (e) {}
    try { synth.cancel(); } catch (e) {}
    online();
  };

  const utter = () => {
    try {
      u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = 0.9;
      u.onend = () => { stopGuards(); setTTSStatus('sys'); end(); };
      /* 被 cancel/interrupt 打断不是故障：只收尾不转在线（多半是新词开读了） */
      u.onerror = ev => {
        if (ev && (ev.error === 'canceled' || ev.error === 'interrupted')) { stopGuards(); end(); return; }
        giveUp();
      };
      synth.speak(u);
    } catch (e) {
      console.error('朗读失败', e);
      stopGuards();
      netTTS = true;
      online();
      return;
    }

    /* 启动看门狗：无引擎的设备上 speak() 不报错也不发声 */
    let ticks = 0;
    watchdog = setInterval(() => {
      if (myToken !== speakToken || done) { stopGuards(); return; }
      if (synth.speaking || synth.pending) { stopGuards(); setTTSStatus('sys'); return; }
      if (++ticks >= 8) giveUp();
    }, 300);

    /* 绝对兜底（仅带回调的跟读链路需要）：最迟此时放行 onEnd，绝不卡流程 */
    if (onEnd) {
      deadline = setTimeout(() => {
        if (done || myToken !== speakToken) return;
        stopGuards();
        if (!synth.speaking) netTTS = true;
        try { if (u) { u.onend = null; u.onerror = null; } } catch (e) {}
        try { synth.cancel(); } catch (e) {}
        end();
      }, 8000 + text.length * 60);
    }
  };

  if (speakDeferTimer) { clearTimeout(speakDeferTimer); speakDeferTimer = null; }
  if (synth.speaking || synth.pending) {
    /* Android Chrome 已知竞态：cancel 后立刻 speak 会被吞掉，延迟 60ms 再入队 */
    try { synth.cancel(); } catch (e) {}
    speakDeferTimer = setTimeout(() => { speakDeferTimer = null; utter(); }, 60);
  } else {
    utter();
  }
}

/* 编辑距离（用于 7.4 评分与听写容错展示） */
function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

function similarity(a, b) {
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - editDistance(a, b) / max;
}

/* 7.4.1 词面清洗：供识别语法表与评分比对用。
 * 词库词面带变体注记和占位符——"swing(swung)"、"make sb's/the bed"、
 * "a / an"——识别器与评分都应只看主词面，否则这些词永远匹配不上。
 * 规则：
 *   1) 括号注记整体删除：swing(swung) → swing
 *   2) sb's → somebody's（先于斜杠切）、sb → somebody、sth → something
 *   3) pl. 变体注记删除：knife pl. knives → knife（词库无括号的注记脏数据）
 *   4) 斜杠变体取第一项：a / an → a；theater/ theatre → theater
 *   5) 占位符（... …… ?）与剩余标点删除：too ... to → too to
 *      （学生实际读的就是短语本身，省略号只表示"中间有宾语"）
 *   6) 撇号保留（识别模型词表含 somebody's 等屈折形式）
 * 特判表：斜杠后是并列限定成分的词条（如 make sb's/the bed 保留 bed）。
 * 注：与音频包 word-list.json 的口径不同——那是 TTS 合成口径
 * （省略号保留作停顿、sb. 带句点），评分按学生读音比对故略有差异。 */
const SPEAKABLE_SPECIALS = [
  [/^make somebody's\/the bed$/i, "make somebody's bed"],
];

function speakableWordText(raw) {
  let t = String(raw || '');
  t = t.replace(/\(([^)]*)\)/g, ' ');                  /* 括号注记 */
  t = t.replace(/sb's/gi, "somebody's").replace(/sb\./gi, 'somebody');
  t = t.replace(/\bsth\b/gi, 'something').replace(/\bsb\b/gi, 'somebody');
  t = t.replace(/\s*pl\.\s*\w+/gi, ' ');               /* pl. 变体注记 */
  for (const [re, to] of SPEAKABLE_SPECIALS) {         /* 特判先于斜杠切分 */
    if (re.test(t)) return to;
  }
  t = t.replace(/\s*\/\s*/g, ' / ');                    /* 规整斜杠间距 */
  const slash = t.indexOf('/');
  if (slash >= 0) t = t.slice(0, slash);                /* 斜杠变体取第一项 */
  t = t.replace(/[^A-Za-z' -]/g, ' ');                  /* 去占位符与标点 */
  t = t.replace(/\s+/g, ' ').trim();
  return t.toLowerCase();
}

/* 7.4.1 易混词：词库内与目标词"听起来可能混"的候选，加入识别语法表。
 * 旧版语法只有 [目标词, [unk]] 二选一，任何错读都被强判为目标词高置信——
 * 评分虚高的根因。加入近邻词后，错读有机会被判成别的真实词，分数如实下降。
 * 近邻 = 编辑距离 ≤ 词长阈值（≤3 字距 1；≤6 字距 2；更长距 3），上限 12 个
 * （语法表过大拖慢识别器构建，且长尾词对区分度贡献小）。 */
function confusableWords(target, allTexts) {
  const t = speakableWordText(target);
  if (!t) return [];
  const words = t.split(' ');
  const limit = t.length <= 3 ? 1 : t.length <= 6 ? 2 : 3;
  const out = [];
  for (let i = 0; i < allTexts.length && out.length < 12; i++) {
    const cand = allTexts[i];
    if (cand === t) continue;
    if (Math.abs(cand.length - t.length) > limit) continue;
    const cwords = cand.split(' ');
    /* 短语与单词不互为易混（"pick up" vs "pick" 是不同任务） */
    if (cwords.length !== words.length) continue;
    const d = editDistance(t, cand);
    if (d >= 1 && d <= limit) out.push(cand);
  }
  return out;
}

/* 7.4 跟读评分：0-100
 * 目标词先过 speakableWordText 清洗（与识别语法、音频包一致）。
 * 短语目标（含空格）按整句相似度 + 逐词命中加权——旧版对短语逐 token
 * 与整个短语比相似度，短语永远拿不到高分（"pick up" vs token "pick"）。 */
function scoreFollowRead(target, transcript, confidence) {
  /* transcript 与目标词同口径：保留撇号（识别输出 somebody's，
   * 目标词清洗后也是 somebody's——旧版把 transcript 的撇号删掉，
   * 所有格词永远差一个字符拿不到满分）。弯撇号归一为直撇号
   * （Web Speech 输出 U+2019，Vosk/目标词是 U+0027）。 */
  const t = (transcript || '').trim().toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s-]/g, '');
  const w = speakableWordText(target);
  if (!t) return 0;                       /* 识别不到发音 */
  const conf = typeof confidence === 'number' && confidence > 0 ? Math.min(confidence, 1) : 0.6;
  const tokens = t.split(/\s+/).filter(Boolean);
  const wWords = w.split(' ').filter(Boolean);
  let bestSim;
  if (wWords.length > 1) {
    /* 短语：整句相似度为主，目标词逐个命中有加成 */
    const whole = similarity(w, t.replace(/\s+/g, ' '));
    let hit = 0;
    wWords.forEach(tw => { if (tokens.includes(tw)) hit++; });
    const hitRatio = hit / wWords.length;
    bestSim = Math.max(whole, hitRatio * 0.8);
  } else {
    bestSim = 0;
    tokens.forEach(tok => {
      const s = similarity(w, tok);
      if (s > bestSim) bestSim = s;
    });
  }
  if (bestSim >= 0.999) {
    /* 识别到目标词：基础 75 + 置信度，最高 100 */
    return Math.round(Math.min(100, 75 + conf * 25));
  }
  /* 未完全识别：基础 35 + 相似度与置信度权重 */
  return Math.round(Math.min(100, 35 + bestSim * 40 + conf * 10));
}

function scoreLabel(score) {
  if (score >= 90) return '发音清晰';
  if (score >= 75) return '基本正确，可放慢再读';
  if (score >= 60) return '有识别结果但差距较大';
  return '需要重新听示范';
}
function scoreClass(score) {
  if (score >= 75) return 'score-good';
  if (score >= 60) return 'score-mid';
  return 'score-bad';
}

/* ======================================================
 * 8. 学习会话（5.1 / 5.2 / 5.3 / 7.3）
 * ====================================================== */

/* 会话结构：
 * session = {
 *   taskIds,          当日全部任务词（新词 + 复习词）
 *   phase,            'learn' | 'recognize' | 'spell' | 'listen' | 'done'
 *   idx,              当前词下标
 *   listenNo,         听写序号（从 1 开始）
 *   results,          { wordId: { recognize:bool, spell:bool, listen:bool } }
 *   learnLogged,      Set：已记 learn 事件的新词
 *   startedAt,
 * } */
let session = null;

function startSession() {
  const u = currentUser();
  const task = buildDailyTask(u);
  const taskIds = task.newIds.concat(task.reviewIds);
  if (!taskIds.length) {
    alert('今天没有需要学习的内容。可在家长区扩大背诵范围或添加词库。');
    return;
  }
  const results = {};
  taskIds.forEach(id => { results[id] = { recognize: null, spell: null, listen: null }; });
  session = {
    taskIds,
    newCount: task.newIds.length,
    reviewCount: task.reviewIds.length,
    phase: 'learn',
    idx: 0,
    listenNo: 0,
    results,
    learnLogged: {},
    migrated: {},
    startedAt: Date.now(),
  };
  renderSession();
}

/* 新词学习阶段只包含新词；三题测试覆盖全部任务词 */
function learnQueue() {
  if (!session) return [];
  return session.taskIds.slice(0, session.newCount);
}

function phaseName(p) {
  return { learn: '新词学习', recognize: '认读测试', spell: '拼写测试', listen: '听写测试' }[p] || '';
}

function renderSession() {
  const s = session;
  if (!s) return;
  const wmap = wordMap();

  /* 阶段推进：learn 队列走完后进入 recognize */
  if (s.phase === 'learn' && s.idx >= learnQueue().length) {
    s.phase = 'recognize'; s.idx = 0;
  }
  if (s.phase !== 'learn' && s.phase !== 'done' && s.idx >= s.taskIds.length) {
    if (s.phase === 'recognize') { s.phase = 'spell'; s.idx = 0; }
    else if (s.phase === 'spell') { s.phase = 'listen'; s.idx = 0; s.listenNo = 0; }
    else if (s.phase === 'listen') { finishSession(); return; }
  }

  const total = s.phase === 'learn' ? learnQueue().length : s.taskIds.length;
  const done = s.idx;
  const pct = total ? Math.round((done / total) * 100) : 100;
  const w = wmap[s.taskIds[s.idx]];
  if (!w) { finishSession(); return; }

  let body = '';
  if (s.phase === 'learn') body = renderLearnCard(w);
  else if (s.phase === 'recognize') body = renderRecognizeCard(w);
  else if (s.phase === 'spell') body = renderSpellCard(w);
  else body = renderListenCard(w);

  setContent(`
    <div class="card word-card">
      <div class="stage-tag">${phaseName(s.phase)}（${done + 1}/${total}）</div>
      ${body}
    </div>
    <div id="tts-status" class="tts-status hidden"></div>
    <div class="progress" style="margin-top:8px"><div style="width:${pct}%"></div></div>
  `);

  /* 5.1.6 / 5.2：进入学习卡自动执行"朗读两遍 → 自动录音评分"；
   * 切词时释放上一词的录音与识别资源。"下一个"随时可点，不打断流程。 */
  currentSpeakWord = w; /* 词卡场景标记：speak() 优先用本地音频包 */
  if (s.phase === 'learn') {
    if (fr && fr.wordId !== w.id) releaseFollowRead();
    autoFollowRead(w);
  }
  if (s.phase === 'listen') speak(w.text);
  bindSessionCard(w);
}

/* 自动跟读驱动：朗读示范两遍（间隔 600ms），随后自动开录。
 * 用代际号防重入：切词后旧流程的回调全部作废。 */
function autoFollowRead(w) {
  const gen = ++frGen;
  const box = $('#fr-status');

  if (!anyRecognitionEngine()) {
    box.textContent = '当前浏览器不支持语音识别，跟读评分不可用（可继续学习其他内容）。';
    return;
  }

  /* 绝对死线：无论朗读链因何种原因卡死（网络断/音频层故障/定时器冻结），
   * 最迟 18 秒直接进跟读环节。两遍朗读各 7s 守卫 + 600ms 间隔 ≈ 15s，
   * 18s 覆盖全部正常路径；正常播完时先到先得，死线只是兜底。 */
  let deadlineFired = false;
  const deadline = setTimeout(() => {
    if (gen !== frGen || deadlineFired) return;
    deadlineFired = true;
    vlog('跟读死线触发：朗读链 18s 未推进，直接进跟读（word=' + w.text + '）');
    beginRecording(w, box);
  }, 18000);

  let recorded = false;
  const goRecord = () => {
    if (gen !== frGen || recorded) return; /* 已切词 / 已由死线触发 */
    recorded = true;
    clearTimeout(deadline);
    vlog('示范朗读完成，进入跟读（word=' + w.text + '）');
    beginRecording(w, box);
  };
  vlog('词卡开始：朗读示范 ×2（word=' + w.text + '）');
  /* 第一遍 */
  speak(w.text, () => {
    if (gen !== frGen) return;
    setTimeout(() => {
      if (gen !== frGen) return;
      /* 第二遍 */
      speak(w.text, goRecord);
    }, 600);
  });
}

/* --- 学习卡片（自动跟读流程，5.2）---
 * 进入卡片即自动：朗读示范两遍 → 自动开始录音识别 → 实时展示评分。
 * 无跟读按钮；"下一个"按钮固定在卡片右下角，随时可切词。 */
function renderLearnCard(w) {
  const ex = w.example
    ? `<div class="word-example">${highlightExample(w.example, w.text)}</div>`
    : '';
  const phon = w.phon ? `<div class="word-phon">${esc(w.phon)}</div>` : '';
  return `
    <div class="word-text">${esc(w.text)}</div>
    ${phon}
    <div class="word-pos">${esc(w.pos)}</div>
    <div class="word-meaning">${esc(w.meaning)}</div>
    ${ex}
    <div class="followread-box" id="fr-box">
      <div id="fr-status" class="muted">正在播放示范读音…</div>
      <div id="fr-result" style="margin-top:6px"></div>
    </div>
    <div class="row next-row">
      <button class="btn small ghost" id="btn-replay-word">🔊 重听</button>
      <button class="btn success" id="btn-next">下一个 →</button>
    </div>`;
}

function highlightExample(example, target) {
  const re = new RegExp('\\b' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
  return esc(example).replace(new RegExp('\\b(' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi'),
    '<span class="hl">$1</span>');
}

/* --- 认读卡片：看英文选中文 --- */
function renderRecognizeCard(w) {
  const distractors = shuffle(
    state.words.filter(x => x.enabled && x.id !== w.id && x.meaning !== w.meaning)
  ).slice(0, 3).map(x => x.meaning);
  const options = shuffle([w.meaning].concat(distractors));
  sQuizOptions = options;
  return `
    <div class="word-text">${esc(w.text)}</div>
    <div class="muted">这个词是什么意思？</div>
    <div class="quiz-options" id="quiz-options">
      ${options.map((o, i) => `<button class="btn" data-opt="${i}">${esc(o)}</button>`).join('')}
    </div>`;
}
let sQuizOptions = [];

/* --- 拼写卡片：看中文拼英文 --- */
function renderSpellCard(w) {
  return `
    <div class="word-meaning">${esc(w.meaning)}</div>
    <div class="muted">${esc(w.pos)} —— 请拼写对应的英文单词</div>
    <input type="text" class="spell-input" id="spell-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入英文单词">
    <div class="row" style="margin-top:12px">
      <button class="btn success" id="btn-submit-spell">提交</button>
    </div>
    <div id="spell-feedback" style="margin-top:10px"></div>`;
}

/* --- 听写卡片：听发音拼英文（显示序号） --- */
function renderListenCard(w) {
  return `
    <div class="word-meaning">单词${session.listenNo}：听发音并拼写单词</div>
    <button class="btn ghost" id="btn-replay">🔊 再听一次</button>
    <input type="text" class="spell-input" id="listen-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入英文单词">
    <div class="row" style="margin-top:12px">
      <button class="btn success" id="btn-submit-listen">提交</button>
    </div>
    <div id="listen-feedback" style="margin-top:10px"></div>`;
}

function bindSessionCard(w) {
  const s = session;
  if (s.phase === 'learn') {
    $('#btn-next').onclick = () => {
      releaseFollowRead(); /* 立即停掉旧词的录音/识别/朗读链 */
      recordLearn(w);
      s.idx += 1;
      renderSession();
    };
    /* 重听：手指点击触发（绕开自动播放限制），且不打断进行中的流程 */
    const replay = $('#btn-replay-word');
    if (replay) replay.onclick = () => {
      vlog('手动重听（word=' + w.text + '）');
      speak(w.text);
    };
  } else if (s.phase === 'recognize') {
    $$('#quiz-options .btn').forEach(btn => {
      btn.onclick = () => {
        const chosen = sQuizOptions[Number(btn.dataset.opt)];
        const correct = chosen === w.meaning;
        $$('#quiz-options .btn').forEach(b => {
          if (b.textContent === w.meaning) b.classList.add('correct');
        });
        btn.classList.add(correct ? 'correct' : 'wrong');
        recordQuizResult(w, 'recognize', correct, chosen);
        setTimeout(() => { s.idx += 1; renderSession(); }, correct ? 350 : 1100);
      };
    });
  } else if (s.phase === 'spell') {
    const submit = () => {
      const input = $('#spell-input');
      const val = input.value.trim().toLowerCase();
      if (!val) { input.focus(); return; }
      const correct = val === w.text.toLowerCase();
      $('#spell-feedback').innerHTML = correct
        ? '<span class="score-good">✓ 正确 +2分</span>'
        : `<span class="score-bad">✗ 正确答案：${esc(w.text)}</span>`;
      input.disabled = true;
      $('#btn-submit-spell').disabled = true;
      recordQuizResult(w, 'spell', correct, val);
      setTimeout(() => { s.idx += 1; renderSession(); }, correct ? 500 : 1400);
    };
    $('#btn-submit-spell').onclick = submit;
    $('#spell-input').onkeydown = e => { if (e.key === 'Enter') submit(); };
    $('#spell-input').focus();
  } else if (s.phase === 'listen') {
    session.listenNo += 1; /* 渲染时占用序号（只渲染一次） */
    $('#btn-replay').onclick = () => speak(w.text);
    const submit = () => {
      const input = $('#listen-input');
      const val = input.value.trim().toLowerCase();
      if (!val) { input.focus(); return; }
      const correct = val === w.text.toLowerCase();
      $('#listen-feedback').innerHTML = correct
        ? '<span class="score-good">✓ 正确 +3分</span>'
        : `<span class="score-bad">✗ 正确答案：${esc(w.text)}</span>`;
      input.disabled = true;
      $('#btn-submit-listen').disabled = true;
      recordQuizResult(w, 'listen', correct, val);
      setTimeout(() => { s.idx += 1; renderSession(); }, correct ? 500 : 1400);
    };
    $('#btn-submit-listen').onclick = submit;
    $('#listen-input').onkeydown = e => { if (e.key === 'Enter') submit(); };
    $('#listen-input').focus();
  }
}

/* learn 事件：每个新词每天记一次，+2 分 */
function recordLearn(w) {
  const s = session;
  if (s.learnLogged[w.id]) return;
  s.learnLogged[w.id] = true;
  /* 每天每词只记一次 learn 事件（中途退出重进不重复发 +2 分） */
  const u = currentUser();
  const tk = todayKey();
  if (u.history.some(ev => ev.dateKey === tk && ev.kind === 'learn' && ev.wordId === w.id)) return;
  logEvent('learn', w.id, { points: 2 });
}

/* 认读/拼写/听写：记事件 + 积分，并暂存当天结果用于按天状态迁移 */
function recordQuizResult(w, kind, correct, answer) {
  if (kind !== 'recognize' && kind !== 'spell' && kind !== 'listen') return;
  session.results[w.id][kind] = correct;

  const pointsTable = { recognize: 1, spell: 2, listen: 3 };
  let points = 0;
  if (correct && !alreadyRewardedToday(w.id, kind)) points = pointsTable[kind];
  logEvent(kind, w.id, { correct, answer, points });

  /* 三题均已有结果 → 按天迁移（每天每词只迁移一次） */
  const r = session.results[w.id];
  if (r.recognize != null && r.spell != null && r.listen != null && !session.migrated[w.id]) {
    session.migrated[w.id] = true;
    const allCorrect = r.recognize && r.spell && r.listen;
    applyDayResult(w.id, allCorrect);
  }
}

function finishSession() {
  const u = currentUser();
  /* 8.1 完成今日任务 +10，每天一次 */
  const tk = todayKey();
  const already = u.history.some(ev => ev.dateKey === tk && ev.kind === 'dailyComplete');
  if (!already) logEvent('dailyComplete', null, { points: 10, correct: null });
  releaseFollowRead();
  session = null;
  renderToday();
  alert('今日任务完成！积分 +10');
}

/* --- 跟读流程（5.2）：示范 → 录音 ≤6s（MediaRecorder）+ 识别评分 → 每次尝试可立即回放 --- */

/* fr = {
 *   wordId, busy, attempts,
 *   recordings: [{ url, score, transcript }],   本词历次尝试的录音（blob URL，会话内有效）
 *   recognition, stream, recorder
 * }
 * 录音仅保留在内存中，不长期保存（12.1），切换单词/页面时释放。 */
let fr = null;
let frGen = 0; /* 跟读代际号：切词/重开后旧流程回调作废 */

/* ---------- 语音识别引擎层（双引擎：Web Speech 优先，Vosk 离线降级） ----------
 *
 * 引擎选择：
 * 1. 浏览器有 SpeechRecognition（Chrome/Edge + 谷歌服务可用）→ 用它，评分即时。
 * 2. 没有（国产安卓 pad 无 GMS 等）→ 加载 vendor-vosk.js（本地 WASM）+
 *    model/ 下的本地模型，完全离线识别，无需任何外部服务。
 *
 * Vosk 模型下载到 worker 的 IDBFS（IndexedDB）后持久缓存，只在首次下载约 40MB；
 * 之后即使断网也能用。识别仍走同一条评分链 scoreFollowRead（编辑距离+置信度），
 * 两个引擎对上层完全透明。
 *
 * Vosk 首次失败（模型缺失/加载失败/WASM 不支持）会把 voskBroken 置 true，
 * 后续跟读直接提示不可用，不再反复尝试下载。 */

let voskModel = null;       /* 已就绪的 Vosk Model 实例 */
let voskLoading = null;     /* 进行中的加载 Promise（防重复加载） */
let voskBroken = false;     /* 加载失败标记：避免每次跟读都重试 */
/* 模型分卷下载源（jsDelivr CDN 镜像 GitHub 仓库，国内可达，免实名免注册）。
 * 分卷原因：jsDelivr 单文件 20MB 上限，41MB 模型拆 3 卷。
 * 部署到自己的仓库时把 USER/repo@main 换成实际值（split-model.js 生成 model-cdn/）。 */
let voskPartsTotal = 41138088; /* 三卷总字节（split-model.js 实测；仅进度显示用，以响应头为准） */
const VOSK_CACHE_KEY = 'vosk-model-blob-v1'; /* Cache API 中的完整模型条目 */

/* 模型分卷的多源列表：同一文件多个镜像，逐源故障转移。
 * jsDelivr 国内边缘节点对新上传的大文件回源慢（区域差异：一个节点 200，
 * 另一个 404），单源不可靠；fastly 是 jsDelivr 的备用域名，raw 是最终兜底。 */
const VOSK_PART_SOURCES = [
  p => 'https://cdn.jsdelivr.net/gh/Auto5678/english-words@main/model-cdn/vosk-model.part' + p,
  p => 'https://fastly.jsdelivr.net/gh/Auto5678/english-words@main/model-cdn/vosk-model.part' + p,
  p => 'https://raw.githubusercontent.com/Auto5678/english-words/main/model-cdn/vosk-model.part' + p,
];
const VOSK_PART_COUNT = 3;

function speechRecognitionSupported() {
  return typeof global.SpeechRecognition !== 'undefined' ||
    typeof global.webkitSpeechRecognition !== 'undefined';
}

/* Vosk 可用性：脚本已加载（UMD 挂到 window.Vosk）且未被判死 */
function voskAvailable() {
  return !voskBroken && typeof global.Vosk === 'object' && global.Vosk !== null &&
    typeof global.Vosk.createModel === 'function';
}

function anyRecognitionEngine() {
  return speechRecognitionSupported() || voskAvailable();
}

/* ============ 模型下载管理器（主线程接管，worker 只认 blob） ============
 *
 * 背景：vendor-vosk 的 worker 内部 fetch 模型 URL——无进度、失败即卡死，
 * 且 GitHub Pages 直连在国内大概率拉不动 41MB。此层接管下载：
 * 1) 分卷从 jsDelivr 拉（单卷 ≤14MB，CDN 国内可达）；
 * 2) 逐块读流统计字节 → 真实进度百分比；
 * 3) 拼接成单个 Blob 后：a) 存 Cache API（下次秒加载）b) 生成 blob URL 喂
 *    worker——vendor 代码显式支持 blob: 前缀（new URL(modelUrl, location.href
 *    .replace(/^blob:/,""))），worker 内部下载逻辑对 blob 会直接命中
 *    extracted.ok 缓存或从 blob 读全量；IDBFS 持久化不受影响；
 * 4) 失败可重试（voskBroken 不再永久判死，每次跟读可重新点）。 */

let modelBlobUrl = null; /* 已就绪的模型 blob URL（会话级，页面关闭自动回收） */

async function fetchModelPart(partNo, onBytes) {
  /* 逐源故障转移：某源 404/网络失败自动换下一个（jsDelivr 区域性缓存未就绪的容错） */
  let lastErr = null;
  for (let s = 0; s < VOSK_PART_SOURCES.length; s++) {
    const url = VOSK_PART_SOURCES[s](partNo);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { lastErr = new Error('HTTP ' + res.status + ' @ part' + partNo + '（源' + (s + 1) + '）'); continue; }
      const total = parseInt(res.headers.get('Content-Length'), 10) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        got += value.length;
        if (onBytes) onBytes(got, total);
      }
      if (got === 0) { lastErr = new Error('空响应 @ part' + partNo + '（源' + (s + 1) + '）'); continue; }
      /* 合并分卷内部块 */
      const out = new Uint8Array(got);
      let off = 0;
      chunks.forEach(c => { out.set(c, off); off += c.length; });
      return out;
    } catch (e) {
      lastErr = e;
    }
  }
  throw (lastErr || new Error('分卷 ' + partNo + ' 全部下载源失败'));
}

/* 下载全部分卷 → Blob。优先命中 Cache API（含跨会话持久缓存）。 */
async function downloadModelBlob(onProgress) {
  /* 1) 已有会话级 blob */
  if (modelBlobUrl) return modelBlobUrl;

  /* 2) Cache API 命中 */
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('vosk-model');
      const hit = await cache.match(VOSK_CACHE_KEY);
      if (hit) {
        const blob = await hit.blob();
        if (blob.size > 1024 * 1024) { /* 合理性检查 >1MB */
          modelBlobUrl = URL.createObjectURL(blob);
          if (onProgress) onProgress({ stage: 'cached', pct: 100, loaded: blob.size, total: blob.size });
          return modelBlobUrl;
        }
      }
    } catch (e) { /* Cache API 不可用（旧内核/隐私模式）：直接下载 */ }
  }

  /* 3) 分卷下载（多源故障转移） */
  const buffers = [];
  let loaded = 0;
  for (let i = 0; i < VOSK_PART_COUNT; i++) {
    const buf = await fetchModelPart(i + 1, (partGot) => {
      if (onProgress) onProgress({
        stage: 'downloading',
        part: i + 1,
        parts: VOSK_PART_COUNT,
        loaded: loaded + partGot,
        total: voskPartsTotal,
        pct: Math.min(99, Math.round((loaded + partGot) / voskPartsTotal * 100)),
      });
    });
    buffers.push(buf);
    loaded += buf.length;
  }

  const blob = new Blob(buffers, { type: 'application/gzip' });
  if (blob.size < 1024 * 1024) throw new Error('模型下载不完整（' + blob.size + ' 字节）');

  /* 4) 写入 Cache API 供下次秒加载（失败不影响本次，但记录原因——
   *    静默失败会导致每次启动都重新下载 41MB，用户只看到"又下载了一遍"） */
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('vosk-model');
      await cache.put(VOSK_CACHE_KEY, new Response(blob));
      vlog('模型缓存写入成功（' + (blob.size / 1048576).toFixed(1) + ' MB）');
    } catch (e) {
      vlog('模型缓存写入失败：' + (e && e.message ? e.message : e) + '（下次需重新下载）');
    }
  }

  modelBlobUrl = URL.createObjectURL(blob);
  if (onProgress) onProgress({ stage: 'downloaded', pct: 100, loaded: blob.size, total: blob.size });
  return modelBlobUrl;
}

/* 加载 Vosk 模型（幂等，防并发）。
 * onProgress(info)：{stage:'downloading', part, parts, loaded, total, pct}
 *                  | {stage:'extracting'} | {stage:'cached'} | {stage:'ready'} */
function ensureVoskModel(onProgress) {
  if (voskModel) return Promise.resolve(voskModel);
  if (voskBroken) return Promise.reject(new Error('vosk-unavailable'));
  if (voskLoading) { subscribeVoskProgress(onProgress); return voskLoading; }

  if (typeof global.Vosk === 'undefined') {
    /* index.html 已同步引入 vendor-vosk.js；若将来改为按需加载，可在此动态注入 */
    voskBroken = true;
    return Promise.reject(new Error('vosk-script-missing'));
  }

  const progress = info => publishVoskProgress(info);
  vlog('Vosk 模型加载开始');
  voskProgressLast = null; /* 上一轮加载的进度重放缓存作废 */
  voskLoading = downloadModelBlob(progress).then(blobUrl => {
    vlog('模型就绪（blob URL），开始初始化 WASM 引擎');
    publishVoskProgress({ stage: 'extracting' });
    return global.Vosk.createModel(blobUrl, 0);
  }).then(model => {
    voskModel = model;
    voskLoading = null;
    vlog('Vosk 引擎初始化成功，识别可用');
    publishVoskProgress({ stage: 'ready' });
    voskProgressSubs = []; /* 终态已送达，清订阅表（回调持有 DOM 引用，不清会滞留） */
    return model;
  }, err => {
    voskBroken = true; /* 本次失败；下一次点跟读重新尝试（不清 voskLoading 复用变量语义） */
    voskLoading = null;
    voskProgressSubs = [];
    vlog('Vosk 模型加载失败：' + (err && err.message ? err.message : err));
    console.warn('[vosk] 模型加载失败', err);
    throw (err instanceof Error ? err : new Error('vosk-load-failed'));
  });
  subscribeVoskProgress(onProgress);
  return voskLoading;
}

/* 模型加载进度的多订阅者分发。
 * 背景：预热（preheatVosk）启动加载后，用户中途点跟读也要进度条——
 * 旧实现只认加载发起者的那一个 onProgress，后来的回调被静默丢弃，
 * 跟读界面干等。现在所有关心进度的人都可订阅：
 * - 订阅即重放最近一条进度（后来者立刻看到当前状态，不用等下一个事件）
 * - ready/失败时清空订阅表（Progress 回调持有 DOM 引用，不清会滞留） */
let voskProgressSubs = [];
let voskProgressLast = null;
function subscribeVoskProgress(cb) {
  if (typeof cb !== 'function') return;
  voskProgressSubs.push(cb);
  if (voskProgressLast) { try { cb(voskProgressLast); } catch (e) {} }
}
function publishVoskProgress(info) {
  voskProgressLast = info;
  voskProgressSubs.forEach(cb => { try { cb(info); } catch (e) {} });
}

/* 模型是否已有持久缓存（预热门槛：只预热"用过 Vosk"的设备） */
async function voskModelCached() {
  if (voskModel || modelBlobUrl) return true;
  if (typeof caches === 'undefined') return false;
  try {
    const cache = await caches.open('vosk-model');
    const hit = await cache.match(VOSK_CACHE_KEY);
    return !!(hit && (await hit.blob()).size > 1024 * 1024);
  } catch (e) { return false; }
}

/* Vosk 引擎预热：init() 启动时后台静默初始化，用户点跟读时已就绪。
 *
 * 门槛是"模型已缓存"而不是"无 Web Speech"：华为浏览器等内核的
 * SpeechRecognition 是假活 API（存在但永不返回结果），按 API 存在性
 * 判断会漏掉真正的目标设备；而模型缓存存在本身就证明这台设备
 * 实际用过 Vosk。未缓存设备不预热、零流量（首次下载仍由跟读触发，
 * 界面有进度条）。
 *
 * 失败静默（voskBroken 已置位，跟读时会给出完整错误与重试）；
 * 与跟读并发安全：ensureVoskModel 幂等，共用同一个 voskLoading。 */
async function preheatVosk() {
  if (voskModel || voskLoading || voskBroken) return;
  if (typeof global.Vosk === 'undefined') return;
  if (!await voskModelCached()) return;
  try {
    vlog('Vosk 预热：检测到模型已缓存，后台初始化引擎');
    await ensureVoskModel(null);
  } catch (e) { /* 静默：跟读时再报错并给重试 */ }
}

/* 释放上一词的录音资源 */
function releaseFollowRead() {
  frGen++; /* 旧流程的一切回调（朗读续链/识别结果）立即作废 */
  /* 在线示范音随切词停止（系统 TTS 由新朗读的 cancel / onend 自行收尾） */
  if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; netTTSToken++; }
  if (fr && Array.isArray(fr.recordings)) {
    fr.recordings.forEach(r => { try { URL.revokeObjectURL(r.url); } catch (e) {} });
  }
  if (fr && fr.recognition) {
    /* Web Speech 引擎：abort；Vosk 引擎：无长驻会话（每词新建识别器），无需处理 */
    try { if (typeof fr.recognition.abort === 'function') fr.recognition.abort(); } catch (e) {}
    if (fr.recognition.voskRemove) { try { fr.recognition.remove(); } catch (e) {} }
  }
  if (fr && fr.stream) {
    try { fr.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
  }
  fr = null;
}

/* ============ Web Speech 引擎（浏览器自带，需要谷歌网络服务） ============ */

function beginWebSpeech(w, box) {
  box.textContent = '请跟读…（最长 6 秒）';
  const Rec = global.SpeechRecognition || global.webkitSpeechRecognition;
  const rec = new Rec();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;

  attachSharedRecording(w);

  let gotResult = false;
  let timer = setTimeout(() => { try { rec.stop(); } catch (e) {} }, 6000);

  /* 华为浏览器假活看门狗（两种假活形态全覆盖）：
   * a) start() 成功但 onresult/onerror/onend 一个都不来 → 8 秒强制切 Vosk；
   * b) onend 有来但没有任何识别结果（引擎跑完了空手而归）→ 同样判定假活切 Vosk。
   * 证实一次后 webSpeechDead 置位，本会话后续词卡直接走 Vosk。
   * 幂等标志：killEngine 里 rec.abort() 会异步触发 onend，其"无结果"分支会
   * 再次进来——不加标志会启动两套 Vosk 录音（双麦克风、评分双计）。 */
  let anyEvent = false;
  let resultOrError = false;
  let engineKilled = false;
  const killEngine = (why) => {
    if (engineKilled) return;
    engineKilled = true;
    webSpeechDead = true;
    try { rec.abort(); } catch (e) {}
    /* 不停共享录音：Vosk 接管后继续用同一份录音（回放完整） */
    switchToVosk(w, box, why);
  };
  const watchdog = setTimeout(() => {
    if (gotResult || resultOrError) return;
    killEngine('在线识别无响应，已切换离线引擎（首次需下载约 41MB 模型，仅一次）');
  }, 8000);

  rec.onresult = e => {
    anyEvent = true;
    resultOrError = true;
    gotResult = true;
    clearTimeout(watchdog); /* 已有结果：看门狗不再判假活 */
    stopSharedRecorder();
    /* 取与目标词最匹配的候选 */
    const alts = Array.from(e.results[0]);
    let best = null;
    alts.forEach(alt => {
      const score = scoreFollowRead(w.text, alt.transcript, alt.confidence);
      if (!best || score > best.score) best = { score, transcript: alt.transcript, confidence: alt.confidence };
    });
    finishFollowRead(w, best.score, best.transcript, best.confidence);
  };
  rec.onerror = ev => {
    anyEvent = true;
    resultOrError = true;
    clearTimeout(watchdog); /* 已有错误（如 no-speech）：看门狗不再判假活 */
    if (gotResult) return;
    stopSharedRecorder();
    let msg = '识别失败，请再试一次';
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') msg = '麦克风权限被拒绝，请在浏览器设置中允许麦克风';
    else if (ev.error === 'no-speech') msg = '没有听到声音，请靠近麦克风再读一次';
    else if (ev.error === 'network') {
      /* 谷歌服务不可达（典型：国产安卓 pad 无 GMS）→ 引导走 Vosk 离线引擎 */
      msg = '在线识别服务不可用，正在切换离线识别…';
      try { rec.abort(); } catch (e) {}
      switchToVosk(w, box, '在线识别不可用，已切换离线引擎（首次需下载约 40MB 模型，仅一次）');
      return;
    }
    frBusy(false);
    box.textContent = msg;
  };
  rec.onend = () => {
    anyEvent = true;
    clearTimeout(timer);
    stopSharedRecorder();
    /* 假活形态 b：onend 到了但既无结果也无错误（引擎空转）→ 切 Vosk */
    if (!gotResult && !resultOrError) {
      clearTimeout(watchdog);
      killEngine('在线识别无结果，已切换离线引擎（首次需下载约 41MB 模型，仅一次）');
      return;
    }
    if (!gotResult && fr && fr.busy && !fr.switching) {
      frBusy(false);
      if (box.textContent === '请跟读…（最长 6 秒）') box.textContent = '没有识别到内容，请再试一次';
    }
  };
  try {
    rec.start();
    fr.recognition = rec;
  } catch (e) {
    stopSharedRecorder();
    frBusy(false);
    box.textContent = '无法启动语音识别，请重试';
  }
}

/* ============ Vosk 离线引擎（本地 WASM + 本地模型，无需网络） ============ */

/* 录音流 → Float32 音频块 → model.registerPort(MessagePort) 喂给识别器。
 * 流程：getUserMedia → AudioWorkletNode(无回声路径直采) 或 ScriptProcessorNode 兜底
 * → 每块调用 recognizer.acceptWaveformFloat(samples, sampleRate)
 * → result 事件返回 { text, result:[{conf, word}] } → 复用 scoreFollowRead 评分。 */

/* 7.4.1 识别语法表：目标词 + 词库易混词 + [unk]。
 * 旧版语法仅 ['[unk]', 目标词]，识别器被强制二选一——任何错读都判为目标词
 * 且置信度虚高（家长反馈"发音不准也 100 分"的根因）。加入易混词后，
 * 错读有机会落到别的真实词上，置信度如实反映发音质量。
 * _grammarTextCache 声明在全局状态区（let state 旁）。 */
function libraryTextsForGrammar() {
  if (_grammarTextCache) return _grammarTextCache;
  const set = new Set();
  state.words.forEach(w => {
    const t = speakableWordText(w.text);
    if (t) set.add(t);
  });
  _grammarTextCache = Array.from(set);
  return _grammarTextCache;
}

function buildRecognizerGrammar(word) {
  const target = speakableWordText(word.text);
  const confusables = confusableWords(word.text, libraryTextsForGrammar());
  const list = ['[unk]', target, ...confusables].filter(Boolean);
  return JSON.stringify(list);
}

function switchToVosk(w, box, why) {
  if (fr) fr.switching = true;
  /* 不停共享录音：同词从 Web Speech 切过来时录音保持连续（回放完整）；
   * 旧录音器由 attachSharedRecording 的同词重建分支负责收尾 */
  box.textContent = why || '正在启动离线识别…';
  beginVoskRecording(w, box).catch(err => {
    console.warn('[vosk] 离线识别不可用', err);
    frBusy(false);
    /* 失败不再静默判死：给重试按钮，下次点击重新下载 */
    renderVoskError(box, err && err.message ? err.message : '未知错误');
  });
}

/* 模型下载失败/加载失败的界面：进度条区域变为错误提示 + 重试 */
function renderVoskError(box, msg) {
  const result = $('#fr-result');
  if (!box) return;
  box.innerHTML = `离线识别模型加载失败：${esc(msg)}`;
  if (result) {
    result.innerHTML = `
    <p class="muted" style="margin-top:6px">可能原因：模型尚未下载（首次需联网，约 41MB）、当前无网络，或存储空间不足。<br>
    本次跟读评分跳过，单词学习不受影响；联网后点重试即可恢复。</p>
    <button class="btn small" id="btn-vosk-retry">↻ 重试</button>`;
    const btn = $('#btn-vosk-retry');
    if (btn) btn.onclick = () => {
      voskBroken = false; /* 解除判死，允许重新加载 */
      voskLoading = null;
      result.innerHTML = '';
      switchToVosk(currentSessionWord(), box, '正在重新启动识别…');
    };
  }
}

/* 当前学习卡对应的词（重试时用） */
function currentSessionWord() {
  if (!session) return null;
  const w = wordMap()[session.taskIds[session.idx]];
  return w;
}

/* 模型下载进度条渲染：
 * info: {stage:'downloading', part, parts, loaded, total, pct}
 *      | {stage:'extracting'} | {stage:'cached'} | {stage:'downloaded'} | {stage:'ready'} */
function renderModelProgress(box, info) {
  if (!box) return;
  const mb = n => (n / 1048576).toFixed(1) + ' MB';
  if (info.stage === 'downloading') {
    box.innerHTML = `
      正在下载离线识别模型（第 ${info.part}/${info.parts} 卷，仅首次）
      <div class="model-progress"><div style="width:${info.pct}%"></div></div>
      <span class="muted">${info.pct}% · ${mb(info.loaded)} / ${mb(info.total)}</span>`;
  } else if (info.stage === 'extracting' || info.stage === 'downloaded') {
    /* 每次页面加载都要重初始化 WASM 引擎（缓存免下载，不免初始化）。
     * 与首次下载区分文案，避免"又下载了？"的误解 */
    box.innerHTML = `
      正在启动离线识别引擎（首次 20-40 秒，此后本次打开内秒开）…
      <div class="model-progress indeterminate"><div></div></div>`;
  } else if (info.stage === 'cached') {
    box.textContent = '模型已缓存，正在启动识别…';
  } else if (info.stage === 'ready') {
    box.textContent = '请跟读…';
  }
}

function beginVoskRecording(w, box) {
  const startGen = frGen; /* 下载期间的进度渲染守卫 */
  return ensureVoskModel(info => {
    if (startGen !== frGen) return; /* 已切词：进度不再渲染 */
    renderModelProgress(box, info);
  }).then(model => {
    if (startGen !== frGen) return; /* 期间已切词 */
    /* 直达 Vosk 路径（webSpeechDead 后）没有 Web Speech 阶段建过 fr 会话——
     * 此处补建。守卫用代际号判断"是否还是同一次跟读"，不再依赖 fr 非空 */
    if (!fr || fr.wordId !== w.id || !fr.busy) attachSharedRecording(w);
    /* attachSharedRecording 内部重建会话时 frGen 会 +1：此后的守卫必须用新代际号，
     * 否则 getUserMedia 回调全部被误判"已切词"而静默放弃 */
    const gen = frGen;

    box.textContent = '请跟读…（最长 6 秒）';

    return new Promise((resolve, reject) => {
      let audioCtx = null;
      let node = null;
      let recognizer = null;
      let settled = false;

      const cleanup = () => {
        try { if (node && node.port) node.port.onmessage = null; } catch (e) {}
        try { if (node && node.disconnect) node.disconnect(); } catch (e) {}
        try { if (audioCtx) audioCtx.close(); } catch (e) {}
        try { if (recognizer && recognizer.remove) recognizer.remove(); } catch (e) {}
      };

      global.navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        if (gen !== frGen || !fr || fr.wordId !== w.id || !fr.busy) {
          stream.getTracks().forEach(t => t.stop());
          resolve();
          return;
        }

        audioCtx = new (global.AudioContext || global.webkitAudioContext)();
        /* 华为浏览器等国产内核：AudioContext 初始为 suspended，不 resume 采不到音 */
        if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
          audioCtx.resume().catch(() => {});
        }
        const src = audioCtx.createMediaStreamSource(stream);

        recognizer = new model.KaldiRecognizer(audioCtx.sampleRate, buildRecognizerGrammar(w));
        recognizer.setWords(true);
        recognizer.on('result', msg => {
          if (settled) return;
          settled = true;
          const words = (msg.result && msg.result.result) || [];
          const text = (msg.result && msg.result.text ? msg.result.text.trim() : '');
          /* Vosk 的 conf ∈ [0,1]，等价于 Web Speech 的 confidence */
          const conf = words.length ? words.reduce((s, x) => s + (x.conf || 0), 0) / words.length : 0;
          stopSharedRecorder();
          cleanup();
          stream.getTracks().forEach(t => t.stop());
          const score = scoreFollowRead(w.text, text, conf);
          finishFollowRead(w, score, text, conf);
          resolve();
        });
        recognizer.on('error', () => {
          if (settled) return;
          settled = true;
          cleanup();
          stream.getTracks().forEach(t => t.stop());
          reject(new Error('识别过程出错'));
        });
        fr.recognition = { voskRemove: () => { try { recognizer.remove(); } catch (e) {} } };

        /* 采集：优先 AudioWorklet，Safari/旧内核兜底 ScriptProcessor。
         * Vosk worker 对任意采样率会自动重采样（KaldiRecognizer 创建时传入当前采样率）。 */
        const feed = samples => {
          try { recognizer.acceptWaveformFloat(samples, audioCtx.sampleRate); } catch (e) {}
        };

        /* 采集：优先 AudioWorklet，旧内核兜底 ScriptProcessor。
         * 两类节点都必须接入渲染图才被调度；为避免麦克风外放啸叫，
         * 统一经 gain=0 的静音汇接入 destination。 */
        const mute = audioCtx.createGain();
        mute.gain.value = 0;
        mute.connect(audioCtx.destination);

        if (audioCtx.audioWorklet) {
          const workletCode = `
            class FRProcessor extends AudioWorkletProcessor {
              process(inputs) {
                const ch = inputs[0] && inputs[0][0];
                if (ch) this.port.postMessage(ch.slice(0));
                return true;
              }
            }
            registerProcessor('fr-proc', FRProcessor);`;
          audioCtx.audioWorklet.addModule(URL.createObjectURL(new Blob([workletCode], { type: 'application/javascript' }))).then(() => {
            if (gen !== frGen || !fr || fr.wordId !== w.id || !fr.busy) { cleanup(); stream.getTracks().forEach(t => t.stop()); resolve(); return; }
            node = new AudioWorkletNode(audioCtx, 'fr-proc');
            node.port.onmessage = e => feed(new Float32Array(e.data));
            src.connect(node);
            node.connect(mute);
          }).catch(() => {
            if (gen !== frGen || !fr || fr.wordId !== w.id || !fr.busy) { cleanup(); stream.getTracks().forEach(t => t.stop()); resolve(); return; }
            node = audioCtx.createScriptProcessor(4096, 1, 1);
            node.onaudioprocess = e => feed(e.inputBuffer.getChannelData(0).slice(0));
            src.connect(node);
            node.connect(mute);
          });
        } else {
          node = audioCtx.createScriptProcessor(4096, 1, 1);
          node.onaudioprocess = e => feed(e.inputBuffer.getChannelData(0).slice(0));
          src.connect(node);
          node.connect(mute);
        }

        /* 超时 6 秒：取最终结果 */
        setTimeout(() => {
          if (settled) return;
          try { recognizer.retrieveFinalResult(); } catch (e) {}
          /* retrieveFinalResult 异步返回 result 事件；若无语音，300ms 后收尾 */
          setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            stream.getTracks().forEach(t => t.stop());
            stopSharedRecorder();
            frBusy(false);
            box.textContent = '没有识别到内容，请再试一次';
            resolve();
          }, 400);
        }, 6000);
      }).catch(err => {
        cleanup();
        reject(err && err.name === 'NotAllowedError'
          ? new Error('麦克风权限被拒绝，请在浏览器设置中允许麦克风')
          : (err instanceof Error ? err : new Error('无法启动录音')));
      });
    });
  });
}

/* ============ 共享录音层（两个引擎复用：MediaRecorder 并行录音） ============ */

/* 并行开启麦克风录音（失败不阻塞评分）。引擎层只负责识别，录音统一在这里管理，
 * 保证无论哪个引擎、无论识别成功失败，"播放录音"功能行为一致。 */

function mediaRecorderSupported() {
  return typeof global.MediaRecorder === 'function' &&
    global.navigator && global.navigator.mediaDevices &&
    typeof global.navigator.mediaDevices.getUserMedia === 'function';
}

function attachSharedRecording(w) {
  const ws = getWordState(w.id);
  if (!fr || fr.wordId !== w.id) releaseFollowRead();
  else if (fr.recorder || fr.stream) {
    /* 同词重建（Web Speech → Vosk 引擎切换等）：先停掉旧录音器和麦克风流，
     * 否则引用被覆盖后永不关闭（麦克风指示灯常亮、设备占用） */
    if (fr.recorder && fr.recorder.state !== 'inactive') { try { fr.recorder.stop(); } catch (e) {} }
    if (fr.stream) { try { fr.stream.getTracks().forEach(t => t.stop()); } catch (e) {} }
    fr.recorder = null;
    fr.stream = null;
  }
  fr = {
    wordId: w.id,
    busy: true,
    attempts: fr && fr.wordId === w.id ? fr.attempts : (ws.followReadAttempts || 0),
    recordings: fr && fr.wordId === w.id ? fr.recordings : [],
    recorder: null,
    recorderChunks: [],
  };

  let recorder = null;
  let chunks = [];
  if (mediaRecorderSupported()) {
    global.navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (!fr || fr.wordId !== w.id) { /* 期间已切词 */
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      fr.stream = stream;
      try {
        recorder = new MediaRecorder(stream);
        chunks = [];
        fr.recorder = recorder;
        fr.recorderChunks = chunks;
        recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
          if (!fr || fr.wordId !== w.id) return;
          if (chunks.length) {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            fr.pendingRecording = URL.createObjectURL(blob);
          }
          try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        };
        recorder.start();
      } catch (e) {
        try { stream.getTracks().forEach(t => t.stop()); } catch (e2) {}
      }
    }).catch(() => { /* 麦克风被拒或不可用：仅评分，无录音 */ });
  }
}

function stopSharedRecorder() {
  if (fr && fr.recorder && fr.recorder.state !== 'inactive') {
    try { fr.recorder.stop(); } catch (e) {}
  }
}

function frBusy(busy) {
  if (!fr) return;
  fr.busy = busy;
  if (busy === false) fr.switching = false;
}

/* 引擎入口：有 Web Speech 且未被判假活用 Web Speech，否则直接 Vosk。
 * webSpeechDead：华为浏览器等"引擎存在但不干活"（start 成功、事件永不触发），
 * 看门狗证实一次后本会话直接走 Vosk，省去每张词卡 8 秒的无效等待。 */
let webSpeechDead = false;

function beginRecording(w, box) {
  if (speechRecognitionSupported() && !webSpeechDead) {
    beginWebSpeech(w, box);
  } else {
    switchToVosk(w, box, webSpeechDead ? '正在启动离线识别…' : '正在启动离线识别…');
  }
}

function finishFollowRead(w, score, transcript, confidence) {
  /* 迟到回调防御：识别结果在切词后才返回时 fr 可能已被清空/换成别的词——
   * 直接丢弃，不打掉新会话的状态（旧版对着 null fr 写 busy 会抛错） */
  if (!fr || fr.wordId !== w.id) {
    vlog('丢弃迟到的识别回调（word=' + w.text + '，当前会话已切换）');
    return;
  }
  fr.busy = false;
  fr.attempts += 1;

  /* 5.2.8 保存最后一次评分（不发放积分） */
  const ws = getWordState(w.id);
  ws.followReadScore = score;
  ws.followReadAttempts = fr.attempts;
  ws.followReadAt = Date.now();
  ws.followReadTranscript = transcript || '';
  logEvent('followRead', w.id, { correct: score >= 70, answer: transcript || null, score, points: 0 });

  /* 本次尝试的录音（MediaRecorder 异步收尾，稍等 blob 就绪） */
  const tryAttach = (retries) => {
    if (fr.pendingRecording) {
      fr.recordings.push({ url: fr.pendingRecording, score, transcript: transcript || '' });
      fr.pendingRecording = null;
      renderFollowReadResult(w, score, transcript, ws);
      return;
    }
    if (retries > 0) { setTimeout(() => tryAttach(retries - 1), 120); return; }
    renderFollowReadResult(w, score, transcript, ws); /* 无录音也能出分 */
  };
  renderFollowReadResult(w, score, transcript, ws);
  tryAttach(10);
}

function renderFollowReadResult(w, score, transcript, ws) {
  $('#fr-status').textContent = `第 ${fr.attempts} 次尝试`;
  const recHtml = (fr.recordings || []).map((r, i) => `
    <div class="row" style="margin-top:6px">
      <button class="btn small ghost" data-frplay="${i}">▶ 播放第 ${i + 1} 次录音</button>
      <span class="score-badge ${scoreClass(r.score)}" style="font-size:18px">${r.score}</span>
    </div>`).join('');
  $('#fr-result').innerHTML = `
    <div class="spread">
      <div><span class="score-badge ${scoreClass(score)}">${score}</span> <span class="muted">${scoreLabel(score)}</span></div>
      <div class="muted">已保存评分：${ws.followReadScore == null ? '—' : ws.followReadScore}</div>
    </div>
    <div class="muted" style="margin-top:4px">识别文本：${esc(transcript || '（无）')}</div>
    ${recHtml}`;
  $$('[data-frplay]').forEach(btn => {
    btn.onclick = () => {
      const r = fr.recordings[Number(btn.dataset.frplay)];
      if (!r) return;
      try { new Audio(r.url).play(); } catch (e) { alert('录音播放失败'); }
    };
  });
}

/* ======================================================
 * 9. 阅读流程（5.4）
 * ====================================================== */

/* 生成练习短文：把当日新词放入简单句模板 */
/* 生成练习短文（无内置文章覆盖当日新词时的兜底）。
 * 模板与 tts-audio/gen-articles.py 的 TEMPLATES、wordaudio.js 的
 * GA_OPENS/GA_TMPLS/GA_CLOSES 三方同源——句式改动必须同步三处。
 * 返回 { text, openIdx, wordIds, wordTmplIdxs, closeIdx }：
 * 拼接参数暴露给离线播放层（wordaudio.playGeneratedArticle），
 * 保证离线拼接听到的与屏幕文本逐句一致。 */
function generateArticle(wordTexts) {
  const parts = [];
  const n = wordTexts.length;
  const openers = ['Today I learned some new words.', 'This is my English story.', 'Let me tell you about my day.'];
  const openIdx = Math.floor(Math.random() * openers.length);
  parts.push(openers[openIdx]);
  /* 离线播放需要词 id（音频包按 id 索引）；文本模板用词文本 */
  const wmap = wordMap();
  const byText = {};
  Object.keys(wmap).forEach(id => { byText[wmap[id].text.toLowerCase()] = id; });
  const wordIds = [];
  const wordTmplIdxs = [];
  wordTexts.forEach((wd, i) => {
    const tmpl = [
      `I saw the word "${wd}" in my book, and I wrote it down.`,
      `My teacher said "${wd}" is easy to remember.`,
      `I use the word "${wd}" when I talk with my friends.`,
      `Can you make a sentence with the word "${wd}"?`,
      `The word "${wd}" is very useful in English.`,
    ];
    const ti = i % tmpl.length;
    wordTmplIdxs.push(ti);
    const wid = byText[String(wd).toLowerCase()];
    if (wid) wordIds.push(wid);
    else wordIds.push(null); /* 词库外的词（如自定义句）无离线音频，播放时跳过 */
    parts.push(tmpl[ti]);
  });
  const closeIdx = n > 5 ? 0 : 1;
  parts.push(n > 5 ? 'These words help me read and write. English is fun!' : 'I will review them tomorrow. See you!');
  return { text: parts.join(' '), openIdx, wordIds, wordTmplIdxs, closeIdx };
}

/* 文章中目标词高亮（词边界匹配，忽略大小写） */
function highlightArticle(text, targets) {
  let html = esc(text);
  targets.forEach(t => {
    const safe = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp('\\b(' + safe + ')\\b', 'gi'), '<span class="hl">$1</span>');
  });
  return html;
}

/* 选文章：优先内置覆盖文章，兜底生成 */
function pickDailyArticle() {
  const u = currentUser();
  const task = buildDailyTask(u);
  const wmap = wordMap();
  const newWordTexts = task.newIds.map(id => wmap[id].text);
  const targetSet = new Set(newWordTexts.map(t => t.toLowerCase()));

  /* 内置文章：目标词覆盖率最高者优先（至少覆盖 1 个） */
  let best = null, bestCover = 0;
  BUILT_IN_ARTICLES.filter(a => !a.weekly).forEach(a => {
    const cover = a.words.reduce((n, t) => n + (targetSet.has(t.toLowerCase()) ? 1 : 0), 0);
    if (cover > bestCover) { bestCover = cover; best = a; }
  });

  let title, text, targets, audio; /* audio：离线拼接参数（内置文章=id，生成式=结构） */
  if (best && bestCover > 0) {
    title = best.title; text = best.text; targets = best.words.filter(t => targetSet.has(t.toLowerCase()));
    audio = { kind: 'builtin', id: best.id };
  } else {
    const ga = generateArticle(newWordTexts);
    title = '今日练习短文'; text = ga.text; targets = newWordTexts;
    audio = { kind: 'generated', ga };
  }
  return { title, text, targets, quizPool: targets.length ? targets : newWordTexts, audio };
}

/* 周六中篇：统计本周学过的词 */
function pickWeeklyArticle() {
  const u = currentUser();
  const wmap = wordMap();
  /* 本周（周一起）学过的词 */
  const weekStart = addDays(todayKey(), -((new Date().getDay() + 6) % 7));
  const seen = {};
  u.history.forEach(ev => {
    if (ev.kind === 'learn' && ev.wordId && ev.dateKey >= weekStart) seen[ev.wordId] = true;
  });
  const weekWordTexts = Object.keys(seen).map(id => wmap[id] && wmap[id].text).filter(Boolean);
  const targetSet = new Set(weekWordTexts.map(t => t.toLowerCase()));

  let best = null, bestCover = 0;
  BUILT_IN_ARTICLES.filter(a => a.weekly).forEach(a => {
    const cover = a.words.reduce((n, t) => n + (targetSet.has(t.toLowerCase()) ? 1 : 0), 0);
    if (cover > bestCover) { bestCover = cover; best = a; }
  });

  let title, text, targets, audio;
  if (best && bestCover > 0) {
    title = best.title; text = best.text; targets = best.words.filter(t => targetSet.has(t.toLowerCase()));
    audio = { kind: 'builtin', id: best.id };
  } else {
    const ga = generateArticle(weekWordTexts.slice(0, 20));
    title = '本周练习文章'; text = ga.text; targets = weekWordTexts.slice(0, 20);
    audio = { kind: 'generated', ga };
  }
  return { title, text, targets, quizPool: targets.length ? targets : weekWordTexts, audio };
}

/* 8.1 阅读积分防重复：每天每日短文一次，每周六文章一次 */
function articleRewardedToday(kind) {
  const u = currentUser();
  const tk = todayKey();
  return u.history.some(ev => ev.dateKey === tk && ev.kind === kind && ev.points > 0);
}

function renderReading() {
  const isSaturday = new Date().getDay() === 6;
  const daily = pickDailyArticle();
  const weeklyOK = isSaturday;

  let weeklyHtml;
  if (weeklyOK) {
    const wk = pickWeeklyArticle();
    weeklyHtml = `
      <div class="card">
        <div class="article-title">📖 本周中篇文章：${esc(wk.title)}</div>
        <div class="article-body">${highlightArticle(wk.text, wk.targets)}</div>
        <div class="row" style="margin-top:12px">
          <button class="btn ghost" id="btn-read-weekly">🔊 朗读全文</button>
          <button class="btn" id="btn-quiz-weekly">开始阅读练习（+10分）</button>
          ${articleRewardedToday('weeklyArticle') ? '<span class="tag mastered">今日已得分</span>' : ''}
        </div>
      </div>`;
  } else {
    weeklyHtml = `
      <div class="card">
        <div class="article-title">📖 本周中篇文章</div>
        <p class="muted">中篇文章仅周六开放，本周六再来阅读吧。</p>
      </div>`;
  }

  setContent(`
    <div class="card">
      <div class="article-title">📄 今日短文：${esc(daily.title)}</div>
      <div class="article-body">${highlightArticle(daily.text, daily.targets)}</div>
      <div class="row" style="margin-top:12px">
        <button class="btn ghost" id="btn-read-daily">🔊 朗读全文</button>
        <button class="btn" id="btn-quiz-daily">开始阅读练习（+5分）</button>
        ${articleRewardedToday('article') ? '<span class="tag mastered">今日已得分</span>' : ''}
      </div>
    </div>
    ${weeklyHtml}
    <div id="tts-status" class="tts-status hidden"></div>
  `);

  $('#btn-read-daily').onclick = () => speakArticle(daily, daily.text);
  $('#btn-quiz-daily').onclick = () => openReadingQuiz(daily, 'article', 5);
  if (weeklyOK) {
    const wk = pickWeeklyArticle();
    $('#btn-read-weekly').onclick = () => speakArticle(wk, wk.text);
    $('#btn-quiz-weekly').onclick = () => openReadingQuiz(wk, 'weeklyArticle', 10);
  }
}

/* 阅读练习弹窗：从文章目标词中抽 5 个做选择题 */
function openReadingQuiz(article, kind, basePoints) {
  const wmap = wordMap();
  const byText = {};
  state.words.forEach(w => { byText[w.text.toLowerCase()] = w; });

  const pool = article.quizPool.map(t => byText[t.toLowerCase()]).filter(Boolean);
  if (pool.length < 1) { alert('文章中没有可用于练习的单词。'); return; }
  const picks = shuffle(pool).slice(0, 5);
  const quiz = picks.map(w => {
    const distractors = shuffle(state.words.filter(x => x.enabled && x.id !== w.id && x.meaning !== w.meaning))
      .slice(0, 3).map(x => x.meaning);
    return { w, options: shuffle([w.meaning].concat(distractors)) };
  });

  let qIdx = 0, right = 0;
  const modal = openModal(`
    <h3>阅读练习：${esc(article.title)}</h3>
    <div id="rq-body"></div>
    <div class="modal-actions">
      <button class="btn ghost" id="rq-close">关闭</button>
    </div>
  `);

  function renderQ() {
    if (qIdx >= quiz.length) {
      const acc = quiz.length ? right / quiz.length : 0;
      const pass = acc >= 0.6;
      let rewardMsg;
      if (pass && !articleRewardedToday(kind)) {
        logEvent(kind, null, { correct: true, points: basePoints });
        rewardMsg = `<p style="color:var(--success);font-weight:700">正确率 ${Math.round(acc * 100)}%，获得 ${basePoints} 积分！</p>`;
      } else if (pass) {
        rewardMsg = `<p class="muted">正确率 ${Math.round(acc * 100)}%，今天已领过积分。</p>`;
      } else {
        rewardMsg = `<p class="muted">正确率 ${Math.round(acc * 100)}%，未达到 60%，再读一遍文章吧。</p>`;
      }
      $('#rq-body').innerHTML = `
        <p>练习完成：${right}/${quiz.length} 题正确。</p>
        ${rewardMsg}
        <p class="muted">可以关闭弹窗，也可以稍后再练一次。</p>`;
      $('#rq-close').textContent = '完成';
      return;
    }
    const q = quiz[qIdx];
    $('#rq-body').innerHTML = `
      <p class="muted">第 ${qIdx + 1}/${quiz.length} 题</p>
      <div class="word-text" style="font-size:32px">${esc(q.w.text)}</div>
      <div class="quiz-options">
        ${q.options.map((o, i) => `<button class="btn" data-opt="${i}">${esc(o)}</button>`).join('')}
      </div>`;
    $$('#rq-body .btn').forEach(btn => {
      btn.onclick = () => {
        const correct = q.options[Number(btn.dataset.opt)] === q.w.meaning;
        if (correct) right += 1;
        $$('#rq-body .btn').forEach(b => { if (b.textContent === q.w.meaning) b.classList.add('correct'); });
        if (!correct) btn.classList.add('wrong');
        setTimeout(() => { qIdx += 1; renderQ(); }, correct ? 300 : 900);
      };
    });
  }
  renderQ();
  $('#rq-close').onclick = () => { closeModal(); renderReading(); };
}

/* ======================================================
 * 10. 页面：今日（5.1）
 * ====================================================== */

function renderToday() {
  const u = currentUser();
  const task = buildDailyTask(u);
  const tk = todayKey();
  const doneToday = u.history.some(ev => ev.dateKey === tk && ev.kind === 'dailyComplete');
  const learnedToday = u.history.filter(ev => ev.dateKey === tk && ev.kind === 'learn').length;
  const level = Math.floor(u.points / 100) + 1;
  const inProgress = learnedToday > 0 && !doneToday;

  setContent(`
    <div class="card">
      <h3>你好，${esc(u.name)}</h3>
      <div class="row" style="gap:20px">
        <div>积分 <span class="big-num">${u.points}</span></div>
        <div>等级 <span class="big-num">${level}</span></div>
      </div>
    </div>
    <div class="card">
      <h3>今日任务</h3>
      ${doneToday ? '<p style="color:var(--success)">✓ 今日任务已完成，做得好！</p>' : ''}
      <p>新词：${task.newIds.length} 个（今日已学 ${learnedToday}）</p>
      <p>到期复习：${task.reviewIds.length} 个</p>
      ${inProgress ? '<p class="muted">当天的任务集是固定的：再次进入会继续这一批词，不会换新词。</p>' : ''}
      ${task.newIds.length + task.reviewIds.length > 0
        ? `<button class="btn block" id="btn-start" style="margin-top:10px">${inProgress ? '继续学习' : '开始学习'}</button>`
        : '<p class="muted">今天没有新词和到期复习。可在阅读页做练习，或请家长扩大背诵范围。</p>'}
    </div>
    <div class="card">
      <h3>学习流程</h3>
      <p class="muted">新词学习（自动朗读两遍并跟读评分）→ 认读测试 → 拼写测试 → 听写测试。全部完成获得 +10 积分。</p>
    </div>
  `);
  const b = $('#btn-start');
  if (b) b.onclick = startSession;
}

/* ======================================================
 * 11. 页面：词库（6.2 / 6.3 浏览部分，维护在家长区）
 * ====================================================== */

let libFilter = { gradeId: 'all', unitId: 'all', keyword: '' };

function renderLibrary() {
  const u = currentUser();
  const wmap = wordMap();
  const inScope = new Set(scopeWordIds(u));

  const units = state.units.filter(un =>
    (libFilter.gradeId === 'all' || un.gradeId === libFilter.gradeId) &&
    (libFilter.unitId === 'all' || un.id === libFilter.unitId));
  const unitById = {};
  state.units.forEach(un => { unitById[un.id] = un; });
  const gradeById = {};
  state.grades.forEach(g => { gradeById[g.id] = g; });
  const kw = libFilter.keyword.trim().toLowerCase();

  const rows = state.words.filter(w => {
    if (!units.some(un => un.id === w.unitId)) return false;
    if (kw && !(w.text.toLowerCase().includes(kw) || (w.meaning || '').toLowerCase().includes(kw))) return false;
    return true;
  }).slice(0, 300).map(w => {
    const ws = u.wordStates[w.id];
    const stTag = ws
      ? (ws.status === 'weak' ? '<span class="tag weak">弱项</span>'
        : ws.status === 'mastered' ? '<span class="tag mastered">已掌握</span>'
        : '<span class="tag g">学习中</span>')
      : '';
    return `<tr class="${w.enabled ? '' : 'disabled-row'}">
      <td>${esc(w.text)}</td><td>${esc(w.pos)}</td><td>${esc(w.meaning)}</td>
      <td>${esc(gradeById[unitById[w.unitId].gradeId].title.replace('年级', ''))}</td>
      <td>${esc(unitById[w.unitId].title)}</td>
      <td>${inScope.has(w.id) ? '<span class="tag sel">已选</span>' : ''} ${stTag}</td>
    </tr>`;
  }).join('');

  setContent(`
    <div class="card">
      <h3>词库浏览</h3>
      <div class="form-row">
        <label>学年</label>
        <select id="lib-grade">
          <option value="all">全部学年</option>
          ${state.grades.map(g => `<option value="${g.id}" ${libFilter.gradeId === g.id ? 'selected' : ''}>${esc(g.title)}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <label>单元</label>
        <select id="lib-unit">
          <option value="all">全部单元</option>
          ${state.units.filter(un => libFilter.gradeId === 'all' || un.gradeId === libFilter.gradeId)
            .map(un => `<option value="${un.id}" ${libFilter.unitId === un.id ? 'selected' : ''}>${esc(un.title)}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <label>关键词（英文或中文）</label>
        <input type="text" id="lib-kw" value="${esc(libFilter.keyword)}" placeholder="例如 good 或 家庭">
      </div>
      <p class="muted">当前背诵范围内的词会标记“已选”。新增、编辑词库请到家长区。</p>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>单词</th><th>词性</th><th>释义</th><th>学年</th><th>单元</th><th>状态</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" class="muted">没有符合条件的单词</td></tr>'}</tbody>
      </table>
    </div>
  `);

  $('#lib-grade').onchange = e => { libFilter.gradeId = e.target.value; libFilter.unitId = 'all'; renderLibrary(); };
  $('#lib-unit').onchange = e => { libFilter.unitId = e.target.value; renderLibrary(); };
  let kwTimer = null;
  $('#lib-kw').oninput = e => {
    clearTimeout(kwTimer);
    kwTimer = setTimeout(() => { libFilter.keyword = e.target.value; renderLibrary(); }, 300);
  };
}

/* ======================================================
 * 12. 页面：积分与兑换（8 / 5.5）
 * ====================================================== */

function levelOf(points) { return Math.floor(points / 100) + 1; }

/* 5.5.6 每周/每月兑换上限：按确认时间统计 confirmed 记录 */
function weekKeyOf(ts) { return dateKey(new Date(ts)).slice(0, 4) + '-W' + weekNumber(new Date(ts)); }
function weekNumber(d) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7) + 3); /* 本周四 */
  const week1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round((t - week1) / (7 * 24 * 3600 * 1000));
}

function redemptionCount(u, rewardId, sinceTs) {
  return u.redemptions.filter(r =>
    r.rewardId === rewardId && r.status === 'confirmed' && r.ts >= sinceTs).length;
}

function startOfWeekTs() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}
function startOfMonthTs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function renderPoints() {
  const u = currentUser();
  const level = levelOf(u.points);
  const pending = u.redemptions.filter(r => r.status === 'pending');

  const rewardHtml = state.rewards.map(r => {
    const weekUsed = redemptionCount(u, r.id, startOfWeekTs());
    const monthUsed = redemptionCount(u, r.id, startOfMonthTs());
    const weekFull = r.limitWeek > 0 && weekUsed >= r.limitWeek;
    const monthFull = r.limitMonth > 0 && monthUsed >= r.limitMonth;
    const canRedeem = u.points >= r.points && !weekFull && !monthFull;
    return `
      <div class="list-item">
        <div>
          <div><b>${esc(r.name)}</b></div>
          <div class="muted">${r.points} 分 · 本周 ${weekUsed}/${r.limitWeek || '∞'} · 本月 ${monthUsed}/${r.limitMonth || '∞'}</div>
          ${r.note ? `<div class="muted">${esc(r.note)}</div>` : ''}
        </div>
        <button class="btn small ${canRedeem ? '' : 'ghost'}" data-redeem="${r.id}" ${canRedeem ? '' : 'disabled'}>
          ${u.points < r.points ? '积分不足' : weekFull ? '本周已达上限' : monthFull ? '本月已达上限' : '兑换'}
        </button>
      </div>`;
  }).join('');

  const historyHtml = u.redemptions.slice().reverse().slice(0, 20).map(r => `
    <div class="list-item">
      <div>${esc(r.rewardName)} <span class="muted">（${r.points} 分）</span></div>
      <div>${r.status === 'pending' ? '<span class="tag g">待确认</span>'
        : r.status === 'confirmed' ? '<span class="tag mastered">已确认</span>'
        : '<span class="tag weak">已拒绝</span>'}</div>
    </div>`).join('');

  setContent(`
    <div class="card">
      <h3>我的积分</h3>
      <div class="row" style="gap:20px">
        <div>当前积分 <span class="big-num">${u.points}</span></div>
        <div>等级 <span class="big-num">${level}</span></div>
      </div>
      <p class="muted" style="margin-top:6px">每 100 积分升一级；等级随兑换扣除回退。距下一级还需 ${100 - (u.points % 100)} 分。</p>
      ${pending.length ? `<p class="muted">有 ${pending.length} 个兑换申请待家长确认。</p>` : ''}
    </div>
    <div class="card">
      <h3>可兑换奖励</h3>
      ${rewardHtml || '<p class="muted">暂无奖励，请家长在家长区添加。</p>'}
    </div>
    <div class="card">
      <h3>兑换记录</h3>
      ${historyHtml || '<p class="muted">暂无兑换记录。</p>'}
    </div>
  `);

  $$('[data-redeem]').forEach(btn => {
    btn.onclick = () => requestRedeem(state.rewards.find(r => r.id === btn.dataset.redeem));
  });
}

/* 5.5：申请提交时不扣分，生成 pending 记录，家长确认时扣分 */
function requestRedeem(reward) {
  const u = currentUser();
  if (!reward) return;
  if (u.points < reward.points) { alert('积分不足，继续加油！'); return; }
  const weekUsed = redemptionCount(u, reward.id, startOfWeekTs());
  const monthUsed = redemptionCount(u, reward.id, startOfMonthTs());
  if (reward.limitWeek > 0 && weekUsed >= reward.limitWeek) { alert('该奖励本周兑换已达上限。'); return; }
  if (reward.limitMonth > 0 && monthUsed >= reward.limitMonth) { alert('该奖励本月兑换已达上限。'); return; }

  u.redemptions.push({
    id: uid('redeem'),
    rewardId: reward.id,
    rewardName: reward.name,
    points: reward.points,
    ts: Date.now(),
    status: 'pending',
  });
  saveState();
  alert('兑换申请已提交，请家长在家长区确认。');
  renderPoints();
}

/* ======================================================
 * 13. 页面：报告（9：周报；13.5：月报）
 * ====================================================== */

function weekStartKey() {
  return addDays(todayKey(), -((new Date().getDay() + 6) % 7));
}
function monthStartKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
}
function prevMonthRange() {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const end = new Date(d.getFullYear(), d.getMonth(), 0);
  const fmt = dt => dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-01';
  return { startKey: fmt(start), endKey: dateKey(end) };
}

let reportTab = 'week'; /* week | month */

/* 周期统计（周/月复用）：事件聚合 + 重点强化 + 错误明细 */
function computePeriodStats(u, startKey, endKey) {
  const wmap = wordMap();
  const events = u.history.filter(ev => ev.dateKey >= startKey && ev.dateKey <= endKey);

  const kindStats = { recognize: [0, 0], spell: [0, 0], listen: [0, 0] }; /* [对, 总] */
  events.forEach(ev => {
    if (kindStats[ev.kind] && ev.correct != null) {
      kindStats[ev.kind][1] += 1;
      if (ev.correct) kindStats[ev.kind][0] += 1;
    }
  });
  const newWords = new Set(events.filter(ev => ev.kind === 'learn').map(ev => ev.wordId)).size;

  /* 学习天数：有任意学习类事件的日期数 */
  const activeDays = new Set(events
    .filter(ev => ['learn', 'recognize', 'spell', 'listen', 'followRead', 'dailyComplete'].includes(ev.kind))
    .map(ev => ev.dateKey)).size;

  /* 跟读平均分 */
  const frEvents = events.filter(ev => ev.kind === 'followRead' && ev.score != null);
  const frAvg = frEvents.length ? Math.round(frEvents.reduce((s, ev) => s + ev.score, 0) / frEvents.length) : null;

  /* 积分收支 */
  const pointsEarned = events.filter(ev => ev.points > 0).reduce((s, ev) => s + ev.points, 0);
  const pointsSpent = events.filter(ev => ev.points < 0).reduce((s, ev) => s - ev.points, 0);

  /* 重点强化单词（9.2）：错误次数 / 弱项 / 跟读低分 */
  const wordScores = {};
  events.forEach(ev => {
    if (!ev.wordId) return;
    if (!wordScores[ev.wordId]) wordScores[ev.wordId] = { errors: 0, frLow: false };
    if (ev.correct === false) wordScores[ev.wordId].errors += 1;
    if (ev.kind === 'followRead' && ev.score != null && ev.score < 70) wordScores[ev.wordId].frLow = true;
  });
  const focus = Object.keys(wordScores).map(id => {
    const wsState = u.wordStates[id] || {};
    return {
      id,
      word: wmap[id],
      errors: wordScores[id].errors,
      weak: wsState.status === 'weak',
      frLow: wordScores[id].frLow,
    };
  }).filter(x => x.word).map(x => Object.assign(x, {
    rank: x.errors * 3 + (x.weak ? 5 : 0) + (x.frLow ? 2 : 0),
  })).sort((a, b) => b.rank - a.rank || b.errors - a.errors).slice(0, 10);

  /* 错误明细（9.4） */
  const errByDay = {};
  events.forEach(ev => {
    if (ev.correct !== false) return;
    if (!errByDay[ev.dateKey]) errByDay[ev.dateKey] = [];
    errByDay[ev.dateKey].push(ev);
  });

  return { events, kindStats, newWords, activeDays, frAvg, pointsEarned, pointsSpent, focus, errByDay, wmap };
}

function pctOf(st) { return st[1] ? Math.round((st[0] / st[1]) * 100) : null; }

/* 9.3 改进建议（周/月复用） */
function buildAdvice(u, stats) {
  const advice = [];
  const pct = pctOf;
  if (!stats.newWords) advice.push('本期还没有学习新词，先完成今天的新词吧。');
  if (pct(stats.kindStats.spell) != null && pct(stats.kindStats.spell) < 80) advice.push('拼写正确率低于 80%：建议增加拼写复习，写一遍再背一遍。');
  if (pct(stats.kindStats.listen) != null && pct(stats.kindStats.listen) < 80) advice.push('听写正确率低于 80%：先听音再拼写，多重复例句。');
  if (pct(stats.kindStats.recognize) != null && pct(stats.kindStats.recognize) < 85) advice.push('认读正确率低于 85%：先看英文回忆中文，再对照检查。');
  const weakCount = Object.values(u.wordStates).filter(s => s.status === 'weak').length;
  if (weakCount) advice.push(`当前有 ${weakCount} 个弱项词：优先完成它们的拼写和听写。`);
  return advice;
}

function kindNameCn(kind) {
  return { recognize: '认读', spell: '拼写', listen: '听写', followRead: '跟读' }[kind] || kind;
}

function renderReport() {
  const tabs = [['week', '周报'], ['month', '月报']];
  setContent(`
    <div class="parent-tabs" style="margin-bottom:14px">
      ${tabs.map(t => `<button class="btn small ${reportTab === t[0] ? 'active' : ''}" data-rtab="${t[0]}">${t[1]}</button>`).join('')}
      <span style="flex:1"></span>
      <button class="btn small ghost" id="btn-export-word">导出 Word</button>
      <button class="btn small ghost" id="btn-export-pdf">导出 PDF</button>
    </div>
    <div id="report-body"></div>
  `);
  $$('[data-rtab]').forEach(b => {
    b.onclick = () => { reportTab = b.dataset.rtab; renderReport(); };
  });
  $('#btn-export-word').onclick = () => exportReport('word');
  $('#btn-export-pdf').onclick = () => exportReport('pdf');

  if (reportTab === 'week') renderWeeklyReport();
  else renderMonthlyReport();
}

/* --- 周报（9.1-9.4） --- */
function renderWeeklyReport() {
  const u = currentUser();
  const ws = weekStartKey();
  const stats = computePeriodStats(u, ws, todayKey());
  const pct = pctOf;
  const advice = buildAdvice(u, stats);

  $('#report-body').innerHTML = `
    <div class="card">
      <h3>本周表现（${esc(ws)} 起）</h3>
      <div class="stat-grid">
        <div class="stat-box"><div class="label">新学单词</div><div class="value">${stats.newWords}</div></div>
        <div class="stat-box"><div class="label">认读正确率</div><div class="value">${pct(stats.kindStats.recognize) == null ? '—' : pct(stats.kindStats.recognize) + '%'}</div></div>
        <div class="stat-box"><div class="label">拼写正确率</div><div class="value">${pct(stats.kindStats.spell) == null ? '—' : pct(stats.kindStats.spell) + '%'}</div></div>
        <div class="stat-box"><div class="label">听写正确率</div><div class="value">${pct(stats.kindStats.listen) == null ? '—' : pct(stats.kindStats.listen) + '%'}</div></div>
      </div>
    </div>
    ${renderFocusHtml(stats)}
    <div class="card">
      <h3>改进建议</h3>
      ${advice.length ? advice.map(a => `<p>• ${esc(a)}</p>`).join('') : '<p class="muted">各项表现都不错，保持当前节奏。</p>'}
    </div>
    <div class="card">
      <h3>每日错误明细</h3>
      ${renderErrByDayHtml(stats) || '<p class="muted">本周没有错误记录。</p>'}
    </div>`;
}

/* --- 月报：月度学习分析 --- */
function renderMonthlyReport() {
  const u = currentUser();
  const mk = monthStartKey();
  const stats = computePeriodStats(u, mk, todayKey());
  const prev = prevMonthRange();
  const prevStats = computePeriodStats(u, prev.startKey, prev.endKey);
  const pct = pctOf;

  /* 与上月对比（上月无数据时只显示当前值） */
  const cmp = (cur, old) => {
    if (old == null || old === 0) return cur == null ? '—' : `${cur}`;
    if (cur == null) return '—';
    const d = cur - old;
    return `${cur}（${d >= 0 ? '+' : ''}${d}）`;
  };
  const cmpPct = (cur, old) => {
    if (cur == null) return '—';
    if (old == null) return cur + '%';
    const d = cur - old;
    return `${cur}%（${d >= 0 ? '+' : ''}${d}）`;
  };

  /* 本月兑换汇总 */
  const monthRedeems = u.redemptions.filter(r => dateKey(new Date(r.ts)) >= mk);
  const confirmed = monthRedeems.filter(r => r.status === 'confirmed');
  const spentByRedeem = confirmed.reduce((s, r) => s + r.points, 0);

  /* 月度建议：周度规则 + 节奏/跟读/兑换类建议 */
  const advice = buildAdvice(u, stats);
  const daysInMonth = new Date().getDate();
  const expectedDays = Math.round(daysInMonth * (5 / 7)); /* 按每周学 5 天估算 */
  if (stats.activeDays === 0) advice.unshift('本月还没有学习记录，从今天开始吧。');
  else if (expectedDays - stats.activeDays > 3) advice.push(`本月只学习了 ${stats.activeDays} 天：尽量保持每周至少 5 天的节奏。`);
  else advice.push(`本月已学习 ${stats.activeDays} 天，学习节奏很稳定，继续保持！`);
  if (stats.frAvg != null && stats.frAvg < 70) advice.push('跟读平均分低于 70：跟读前先听两遍示范，放慢速度逐字读。');
  if (spentByRedeem > 0) advice.push(`本月兑换消耗 ${spentByRedeem} 积分：兑换后注意保持每日任务完成率。`);

  $('#report-body').innerHTML = `
    <div class="card">
      <h3>本月概览（${esc(mk)} 起）</h3>
      <div class="stat-grid">
        <div class="stat-box"><div class="label">新学单词</div><div class="value">${stats.newWords}</div></div>
        <div class="stat-box"><div class="label">学习天数</div><div class="value">${stats.activeDays}</div></div>
        <div class="stat-box"><div class="label">跟读平均分</div><div class="value">${stats.frAvg == null ? '—' : stats.frAvg}</div></div>
        <div class="stat-box"><div class="label">获得积分</div><div class="value">${stats.pointsEarned}</div></div>
      </div>
    </div>
    <div class="card">
      <h3>正确率与上月对比</h3>
      <table>
        <thead><tr><th>项目</th><th>本月</th><th>较上月</th></tr></thead>
        <tbody>
          <tr><td>认读正确率</td><td>${pct(stats.kindStats.recognize) == null ? '—' : pct(stats.kindStats.recognize) + '%'}</td><td>${cmpPct(pct(stats.kindStats.recognize), pct(prevStats.kindStats.recognize))}</td></tr>
          <tr><td>拼写正确率</td><td>${pct(stats.kindStats.spell) == null ? '—' : pct(stats.kindStats.spell) + '%'}</td><td>${cmpPct(pct(stats.kindStats.spell), pct(prevStats.kindStats.spell))}</td></tr>
          <tr><td>听写正确率</td><td>${pct(stats.kindStats.listen) == null ? '—' : pct(stats.kindStats.listen) + '%'}</td><td>${cmpPct(pct(stats.kindStats.listen), pct(prevStats.kindStats.listen))}</td></tr>
          <tr><td>新学单词</td><td>${stats.newWords}</td><td>${cmp(stats.newWords, prevStats.newWords)}</td></tr>
          <tr><td>学习天数</td><td>${stats.activeDays}</td><td>${cmp(stats.activeDays, prevStats.activeDays)}</td></tr>
          <tr><td>跟读平均分</td><td>${stats.frAvg == null ? '—' : stats.frAvg}</td><td>${cmp(stats.frAvg, prevStats.frAvg)}</td></tr>
        </tbody>
      </table>
      ${prevStats.newWords === 0 && prevStats.activeDays === 0 ? '<p class="muted" style="margin-top:6px">上月暂无学习记录，无法对比。</p>' : ''}
    </div>
    <div class="card">
      <h3>积分与兑换</h3>
      <div class="stat-grid">
        <div class="stat-box"><div class="label">获得积分</div><div class="value">${stats.pointsEarned}</div></div>
        <div class="stat-box"><div class="label">兑换消耗</div><div class="value">${spentByRedeem || 0}</div></div>
        <div class="stat-box"><div class="label">兑换次数</div><div class="value">${confirmed.length}</div></div>
        <div class="stat-box"><div class="label">待确认</div><div class="value">${monthRedeems.filter(r => r.status === 'pending').length}</div></div>
      </div>
      ${confirmed.length ? `
        <table style="margin-top:10px">
          <thead><tr><th>奖励</th><th>积分</th><th>时间</th></tr></thead>
          <tbody>${confirmed.slice(-10).reverse().map(r => `
            <tr><td>${esc(r.rewardName)}</td><td>${r.points}</td><td class="muted">${esc(dateKey(new Date(r.ts)))}</td></tr>`).join('')}
          </tbody>
        </table>` : ''}
    </div>
    ${renderFocusHtml(stats)}
    <div class="card">
      <h3>月度建议</h3>
      ${advice.length ? advice.map(a => `<p>• ${esc(a)}</p>`).join('') : '<p class="muted">各项表现都不错，保持当前节奏。</p>'}
    </div>
    <div class="card">
      <h3>每日错误明细（本月）</h3>
      ${renderErrByDayHtml(stats) || '<p class="muted">本月没有错误记录。</p>'}
    </div>`;
}

/* 重点强化单词 HTML（周/月复用） */
function renderFocusHtml(stats) {
  return `
    <div class="card">
      <h3>重点强化单词</h3>
      ${stats.focus.length ? stats.focus.map(x => `
        <div class="list-item">
          <div><b>${esc(x.word.text)}</b> <span class="muted">${esc(x.word.meaning)}</span></div>
          <div>${x.weak ? '<span class="tag weak">弱项</span>' : ''}${x.errors ? `<span class="tag g">错 ${x.errors} 次</span>` : ''}${x.frLow ? '<span class="tag g">跟读低分</span>' : ''}</div>
        </div>`).join('')
      : '<p class="muted">本期没有需要重点强化的单词，继续保持！</p>'}
    </div>`;
}

/* 错误明细 HTML（周/月复用） */
function renderErrByDayHtml(stats) {
  const days = Object.keys(stats.errByDay).sort().reverse();
  if (!days.length) return '';
  return days.map(day => `
    <h4>${esc(day)}</h4>
    ${stats.errByDay[day].map(ev => {
      const w = stats.wmap[ev.wordId];
      return `<div class="err-item">
        <b>${esc(w ? w.text : '?')}</b> · ${kindNameCn(ev.kind)}
        ${ev.answer != null ? ` · 答案：<span class="muted">${esc(ev.answer)}</span>` : ''}
        ${ev.score != null ? ` · 跟读评分：<b>${ev.score}</b>` : ''}
      </div>`;
    }).join('')}`).join('');
}

/* ======================================================
 * 13.5 报告导出（Word / PDF）
 * ====================================================== */

/* 导出文档统一为独立 HTML：
 * - word：内联样式 + Word 命名空间，保存为 .doc，Word/WPS 可直接打开编辑；
 * - pdf：新窗口打开打印版，用浏览器"另存为 PDF"。 */
function exportReport(mode) {
  const u = currentUser();
  const isWeek = reportTab === 'week';
  const startKey = isWeek ? weekStartKey() : monthStartKey();
  const title = (isWeek ? '每周学习报告' : '每月学习分析报告') + ' - ' + u.name;

  const bodyHtml = isWeek ? buildWeeklyReportDoc(u) : buildMonthlyReportDoc(u);

  const doc = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<style>
  body { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; color: #222; margin: 32px; font-size: 14px; }
  h1 { font-size: 22px; border-bottom: 3px solid #4a6cf7; padding-bottom: 8px; }
  h2 { font-size: 17px; margin: 22px 0 8px; color: #2a3245; }
  h3 { font-size: 15px; margin: 14px 0 6px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; }
  th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; }
  th { background: #eef1ff; }
  .meta { color: #666; font-size: 13px; margin: 4px 0 0; }
  .stat { display: inline-block; border: 1px solid #bbb; border-radius: 6px; padding: 10px 18px; margin: 4px 8px 4px 0; text-align: center; }
  .stat b { display: block; font-size: 20px; color: #4a6cf7; }
  .err { margin: 2px 0; }
  .muted { color: #777; }
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<p class="meta">学生：${esc(u.name)} ｜ 周期：${esc(startKey)} 至 ${esc(todayKey())} ｜ 导出时间：${esc(new Date().toLocaleString('zh-CN'))}</p>
${bodyHtml}
</body>
</html>`;

  if (mode === 'word') {
    const blob = new Blob(['\ufeff' + doc], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (isWeek ? '周报' : '月报') + '-' + u.name + '-' + todayKey() + '.doc';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } else {
    /* pdf：打印版，浏览器打印对话框选择"另存为 PDF" */
    const win = window.open('', '_blank');
    if (!win) { alert('弹出窗口被拦截，请允许弹窗后重试。'); return; }
    win.document.write(doc);
    win.document.close();
    win.focus();
    setTimeout(() => { try { win.print(); } catch (e) {} }, 400);
  }
}

/* 文档用（非交互）周报正文 */
function buildWeeklyReportDoc(u) {
  const ws = weekStartKey();
  const stats = computePeriodStats(u, ws, todayKey());
  const pct = pctOf;
  const advice = buildAdvice(u, stats);
  return `
  <h2>一、本周表现</h2>
  ${docStats([
    ['新学单词', stats.newWords],
    ['认读正确率', pct(stats.kindStats.recognize) == null ? '—' : pct(stats.kindStats.recognize) + '%'],
    ['拼写正确率', pct(stats.kindStats.spell) == null ? '—' : pct(stats.kindStats.spell) + '%'],
    ['听写正确率', pct(stats.kindStats.listen) == null ? '—' : pct(stats.kindStats.listen) + '%'],
  ])}
  ${docFocus(stats)}
  <h2>三、改进建议</h2>
  ${advice.length ? advice.map(a => `<p>• ${esc(a)}</p>`).join('') : '<p class="muted">各项表现都不错，保持当前节奏。</p>'}
  ${docErrors(stats, '四、每日错误明细')}`;
}

/* 文档用（非交互）月报正文 */
function buildMonthlyReportDoc(u) {
  const mk = monthStartKey();
  const stats = computePeriodStats(u, mk, todayKey());
  const prev = prevMonthRange();
  const prevStats = computePeriodStats(u, prev.startKey, prev.endKey);
  const pct = pctOf;
  const advice = buildAdvice(u, stats);

  const cmp = (cur, old) => {
    if (old == null || old === 0) return cur == null ? '—' : String(cur);
    if (cur == null) return '—';
    const d = cur - old;
    return `${cur}（${d >= 0 ? '+' : ''}${d}）`;
  };
  const cmpPct = (cur, old) => {
    if (cur == null) return '—';
    if (old == null) return cur + '%';
    const d = cur - old;
    return `${cur}%（${d >= 0 ? '+' : ''}${d}）`;
  };
  const monthRedeems = u.redemptions.filter(r => dateKey(new Date(r.ts)) >= mk);
  const confirmed = monthRedeems.filter(r => r.status === 'confirmed');
  const spentByRedeem = confirmed.reduce((s, r) => s + r.points, 0);

  return `
  <h2>一、本月概览</h2>
  ${docStats([
    ['新学单词', stats.newWords],
    ['学习天数', stats.activeDays],
    ['跟读平均分', stats.frAvg == null ? '—' : stats.frAvg],
    ['获得积分', stats.pointsEarned],
    ['兑换消耗', spentByRedeem || 0],
  ])}
  <h2>二、正确率与上月对比</h2>
  <table>
    <tr><th>项目</th><th>本月</th><th>较上月</th></tr>
    <tr><td>认读正确率</td><td>${pct(stats.kindStats.recognize) == null ? '—' : pct(stats.kindStats.recognize) + '%'}</td><td>${cmpPct(pct(stats.kindStats.recognize), pct(prevStats.kindStats.recognize))}</td></tr>
    <tr><td>拼写正确率</td><td>${pct(stats.kindStats.spell) == null ? '—' : pct(stats.kindStats.spell) + '%'}</td><td>${cmpPct(pct(stats.kindStats.spell), pct(prevStats.kindStats.spell))}</td></tr>
    <tr><td>听写正确率</td><td>${pct(stats.kindStats.listen) == null ? '—' : pct(stats.kindStats.listen) + '%'}</td><td>${cmpPct(pct(stats.kindStats.listen), pct(prevStats.kindStats.listen))}</td></tr>
    <tr><td>新学单词</td><td>${stats.newWords}</td><td>${cmp(stats.newWords, prevStats.newWords)}</td></tr>
    <tr><td>学习天数</td><td>${stats.activeDays}</td><td>${cmp(stats.activeDays, prevStats.activeDays)}</td></tr>
    <tr><td>跟读平均分</td><td>${stats.frAvg == null ? '—' : stats.frAvg}</td><td>${cmp(stats.frAvg, prevStats.frAvg)}</td></tr>
  </table>
  ${confirmed.length ? `
  <h2>三、本月兑换记录</h2>
  <table>
    <tr><th>奖励</th><th>积分</th><th>时间</th></tr>
    ${confirmed.slice(-10).reverse().map(r => `<tr><td>${esc(r.rewardName)}</td><td>${r.points}</td><td>${esc(dateKey(new Date(r.ts)))}</td></tr>`).join('')}
  </table>` : ''}
  ${docFocus(stats)}
  <h2>${confirmed.length ? '四' : '三'}、月度建议</h2>
  ${advice.length ? advice.map(a => `<p>• ${esc(a)}</p>`).join('') : '<p class="muted">各项表现都不错，保持当前节奏。</p>'}
  ${docErrors(stats, (confirmed.length ? '五' : '四') + '、每日错误明细')}`;
}

function docStats(items) {
  return '<p>' + items.map(([label, val]) =>
    `<span class="stat"><b>${esc(String(val))}</b>${esc(label)}</span>`).join('') + '</p>';
}

function docFocus(stats) {
  if (!stats.focus.length) return '<h2>重点强化单词</h2><p class="muted">本期没有需要重点强化的单词。</p>';
  return `
  <h2>重点强化单词</h2>
  <table>
    <tr><th>单词</th><th>释义</th><th>状态</th></tr>
    ${stats.focus.map(x => `
      <tr>
        <td><b>${esc(x.word.text)}</b></td><td>${esc(x.word.meaning)}</td>
        <td>${[x.weak ? '弱项' : '', x.errors ? `错 ${x.errors} 次` : '', x.frLow ? '跟读低分' : ''].filter(Boolean).join('，') || '—'}</td>
      </tr>`).join('')}
  </table>`;
}

function docErrors(stats, heading) {
  const days = Object.keys(stats.errByDay).sort().reverse();
  if (!days.length) return `<h2>${esc(heading)}</h2><p class="muted">本期没有错误记录。</p>`;
  return `
  <h2>${esc(heading)}</h2>
  ${days.map(day => `
    <h3>${esc(day)}</h3>
    ${stats.errByDay[day].map(ev => {
      const w = stats.wmap[ev.wordId];
      return `<p class="err"><b>${esc(w ? w.text : '?')}</b> · ${kindNameCn(ev.kind)}` +
        (ev.answer != null ? ` · 答案：${esc(ev.answer)}` : '') +
        (ev.score != null ? ` · 跟读评分：${ev.score}` : '') + '</p>';
    }).join('')}`).join('')}`;
}

/* ======================================================
 * 14. 弹窗与通用渲染
 * ====================================================== */

function setContent(html) {
  $('#content').innerHTML = html;
  $('#content').scrollTop = 0;
}

function openModal(innerHtml) {
  const root = $('#modal-root');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="modal">${innerHtml}</div>`;
  return root;
}
function closeModal() {
  const root = $('#modal-root');
  root.classList.add('hidden');
  root.innerHTML = '';
}

/* ======================================================
 * 15. 切换学生（5.6）
 * ====================================================== */

function openSwitchUserModal() {
  openModal(`
    <h3>切换学生</h3>
    <p class="muted">需要家长密码。</p>
    <div class="form-row">
      <input type="password" id="su-pwd" placeholder="家长密码" autocomplete="off">
    </div>
    <div class="modal-actions">
      <button class="btn ghost" id="su-cancel">取消</button>
      <button class="btn" id="su-ok">确认</button>
    </div>
  `);
  $('#su-pwd').focus();
  $('#su-cancel').onclick = closeModal;
  $('#su-ok').onclick = () => {
    if ($('#su-pwd').value !== state.settings.parentPassword) {
      alert('密码错误，请重新输入。');
      $('#su-pwd').value = '';
      $('#su-pwd').focus();
      return;
    }
    showUserList();
  };
  $('#su-pwd').onkeydown = e => { if (e.key === 'Enter') $('#su-ok').click(); };
}

function showUserList() {
  openModal(`
    <h3>选择学生</h3>
    ${state.users.map((u, i) => `
      <div class="list-item">
        <div><b>${esc(u.name)}</b> <span class="muted">积分 ${u.points}</span></div>
        <button class="btn small" data-user="${i}">${i === state.activeUser ? '当前' : '进入'}</button>
      </div>`).join('')}
    <div class="modal-actions">
      <button class="btn ghost" id="su-close">关闭</button>
    </div>
  `);
  $$('[data-user]').forEach(btn => {
    btn.onclick = () => {
      state.activeUser = Number(btn.dataset.user);
      saveState();
      closeModal();
      renderApp();
    };
  });
  $('#su-close').onclick = closeModal;
}

/* 新增学生账号（11.4）：姓名必填，继承默认学习配置，上限 4 个 */
function openAddStudentModal() {
  if (state.users.length >= 4) {
    alert('学生数已达上限（4 个）。');
    return;
  }
  openModal(`
    <h3>新增学生</h3>
    <div class="form-row">
      <label>学生姓名</label>
      <input type="text" id="as-name" placeholder="例如：小明" maxlength="12">
    </div>
    <p class="muted">初始配置：每日新词 10 个、复习上限 40、背诵范围为七年级上册。可稍后在学生设置和背诵范围中调整。</p>
    <div class="modal-actions">
      <button class="btn ghost" id="as-cancel">取消</button>
      <button class="btn" id="as-ok">创建</button>
    </div>
  `);
  $('#as-name').focus();
  $('#as-cancel').onclick = renderParentArea;
  $('#as-ok').onclick = () => {
    const name = $('#as-name').value.trim();
    if (!name) { alert('请输入学生姓名。'); $('#as-name').focus(); return; }
    if (state.users.some(x => x.name === name)) { alert('已存在同名学生，请换一个名字。'); return; }
    addUser(name);
    alert(`学生“${name}”已创建。`);
    renderApp();
    renderParentArea();
  };
  $('#as-name').onkeydown = e => { if (e.key === 'Enter') $('#as-ok').click(); };
}

function addUser(name) {
  const id = 'user-' + (state.users.length + 1) + '-' + Math.random().toString(36).slice(2, 6);
  const u = makeUser(id, name);
  state.users.push(u);
  saveState();
  return u;
}

/* ======================================================
 * 16. 家长区（11.3）
 * ====================================================== */

let parentTab = 'redeem';

function openParentModal() {
  openModal(`
    <h3>家长区</h3>
    <p class="muted">请输入家长密码。</p>
    <div class="form-row">
      <input type="password" id="pa-pwd" placeholder="家长密码" autocomplete="off">
    </div>
    <div class="modal-actions">
      <button class="btn ghost" id="pa-cancel">取消</button>
      <button class="btn" id="pa-ok">进入</button>
    </div>
  `);
  $('#pa-pwd').focus();
  $('#pa-cancel').onclick = closeModal;
  $('#pa-ok').onclick = () => {
    if ($('#pa-pwd').value !== state.settings.parentPassword) {
      alert('密码错误，请重新输入。');
      $('#pa-pwd').value = '';
      $('#pa-pwd').focus();
      return;
    }
    renderParentArea();
  };
  $('#pa-pwd').onkeydown = e => { if (e.key === 'Enter') $('#pa-ok').click(); };
}

function renderParentArea() {
  const u = currentUser();
  const tabs = [
    ['redeem', '待确认兑换'], ['students', '学生设置'], ['scope', '背诵范围'],
    ['rewards', '奖励商品'], ['words', '词库管理'], ['backup', '数据备份'],
    ['voice', '语音诊断'], ['audio', '离线发音'],
  ];
  let body = '';

  if (parentTab === 'redeem') {
    const pending = [];
    state.users.forEach((usr, ui) => {
      usr.redemptions.filter(r => r.status === 'pending').forEach(r => {
        pending.push({ ui, usr, r });
      });
    });
    body = `
      <h4>待确认兑换</h4>
      ${pending.length ? pending.map(p => `
        <div class="list-item">
          <div>
            <b>${esc(p.usr.name)}</b> 申请 <b>${esc(p.r.rewardName)}</b>
            <div class="muted">${p.r.points} 分 · 当前积分 ${p.usr.points}</div>
          </div>
          <div class="row">
            <button class="btn small success" data-confirm="${p.ui}:${p.r.id}">确认</button>
            <button class="btn small danger" data-reject="${p.ui}:${p.r.id}">拒绝</button>
          </div>
        </div>`).join('')
      : '<p class="muted">没有待确认的兑换申请。</p>'}`;
  } else if (parentTab === 'students') {
    body = `
      <h4>学生设置</h4>
      ${state.users.map((usr, i) => `
        <div class="list-item">
          <div>
            <div class="form-row"><label>姓名</label><input type="text" data-uname="${i}" value="${esc(usr.name)}"></div>
            <div class="row">
              <div class="form-row"><label>每日新词数（固定 10）</label><span class="big-num">${DAILY_NEW_MAX}</span></div>
              <div class="form-row"><label>复习上限</label><input type="number" data-urev="${i}" value="${usr.reviewLimit}" min="0" max="200" style="width:100px"></div>
            </div>
          </div>
        </div>`).join('')}
      <div class="modal-actions">
        <button class="btn" id="stu-save">保存学生设置</button>
        <button class="btn ghost" id="stu-add" ${state.users.length >= 4 ? 'disabled' : ''}>
          ${state.users.length >= 4 ? '学生数已达上限（4）' : '+ 新增学生'}
        </button>
      </div>`;
  } else if (parentTab === 'scope') {
    const gradeById = {};
    state.grades.forEach(g => { gradeById[g.id] = g; });
    body = `
      <h4>当前学生：${esc(u.name)} 的背诵范围</h4>
      <p class="muted">勾选学年；如需细分，再勾选单元（不勾单元默认整学年）。</p>
      ${state.grades.map(g => {
        const units = state.units.filter(un => un.gradeId === g.id);
        const gradeOn = u.scopeGrades.includes(g.id);
        return `
          <div class="form-row">
            <label><b>${esc(g.title)}</b></label>
            <div class="check-grid">
              <div class="check-item ${gradeOn ? 'on' : ''}" data-sgrade="${g.id}">📖 ${esc(g.title)}</div>
              ${units.map(un => {
                const on = gradeOn && u.scopeUnits.includes(un.id);
                const full = gradeOn && !u.scopeUnits.length;
                return `<div class="check-item ${on || full ? 'on' : ''}" data-sunit="${un.id}">${esc(un.title)}</div>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}
      <div class="modal-actions"><button class="btn" id="scope-hint-close">完成</button></div>`;
  } else if (parentTab === 'rewards') {
    body = `
      <h4>奖励商品</h4>
      ${state.rewards.map(r => `
        <div class="list-item">
          <div><b>${esc(r.name)}</b> <span class="muted">${r.points} 分 · 周 ${r.limitWeek || '∞'} / 月 ${r.limitMonth || '∞'}</span></div>
          <button class="btn small ghost" data-editreward="${r.id}">编辑</button>
        </div>`).join('')}
      <div class="modal-actions">
        <button class="btn" id="reward-add">新增奖励</button>
      </div>`;
  } else if (parentTab === 'words') {
    body = `
      <h4>词库管理</h4>
      <p class="muted">按学年查看与维护。点击学年标题旁的 <b>导入词库文件</b>，可选择 Excel（.xlsx）文件导入该学年的单词（会替换该学年原有单词和单元，其他学年不受影响）。</p>
      <div class="row" style="margin-bottom:10px">
        <button class="btn small" id="w-add">新增单词</button>
        <button class="btn small ghost" id="w-addunit">新增单元</button>
      </div>
      <div class="form-row"><input type="text" id="w-kw" placeholder="筛选：英文 / 中文 / 单元名"></div>
      ${state.grades.map(g => {
        const nWords = state.words.filter(w => {
          const un = state.units.find(x => x.id === w.unitId);
          return un && un.gradeId === g.id;
        }).length;
        return `
          <div class="grade-block">
            <div class="grade-head">
              <b>${esc(g.title)}</b>
              <span class="muted">${nWords} 词</span>
              <button class="btn small" data-wimport="${g.id}">📂 导入词库文件</button>
            </div>
            <div id="w-list-${g.id}"></div>
          </div>`;
      }).join('')}
      <input type="file" id="w-import-file" accept=".xlsx,.xls" style="display:none">`;
  } else if (parentTab === 'backup') {
    body = `
      <h4>数据备份</h4>
      <p class="muted">导出全部数据（两个学生、词库、奖励）为 JSON 文件；导入时补齐缺失字段。</p>
      <div class="modal-actions">
        <button class="btn" id="bk-export">导出备份</button>
        <button class="btn ghost" id="bk-import">导入备份</button>
      </div>
      <input type="file" id="bk-file" accept=".json" style="display:none">
      <h4 style="margin-top:18px">修改家长密码</h4>
      <div class="form-row"><label>新密码</label><input type="password" id="bk-newpwd" autocomplete="new-password"></div>
      <div class="form-row"><label>确认新密码</label><input type="password" id="bk-newpwd2" autocomplete="new-password"></div>
      <div class="modal-actions"><button class="btn" id="bk-savepwd">修改密码</button></div>
      <h4 style="margin-top:22px">数据重置</h4>
      <p class="muted">清除学习数据：勾选要清除的学生，删除其学习进度、学习记录、积分和兑换记录；保留姓名、每日词数等设置，以及词库和奖励配置。</p>
      <div class="check-grid" style="margin-bottom:8px">
        ${state.users.map((usr, i) => `
          <div class="check-item on" data-clearuser="${i}">✓ ${esc(usr.name)}</div>`).join('')}
      </div>
      <div class="modal-actions"><button class="btn danger" id="bk-clear-learning">清除勾选学生的学习数据</button></div>
      <p class="muted" style="margin-top:14px">恢复出厂设置：删除全部数据（含词库修改、奖励、密码、全部学生账号），恢复为初始状态。此操作不可恢复，请先导出备份。</p>
      <div class="modal-actions"><button class="btn danger" id="bk-factory-reset">恢复出厂设置</button></div>`;
  } else if (parentTab === 'voice') {
    body = renderVoiceDiag();
  } else if (parentTab === 'audio') {
    body = renderAudioPackPanel();
  }

  openModal(`
    <h3>家长区</h3>
    <div class="parent-tabs">
      ${tabs.map(t => `<button class="btn small ${parentTab === t[0] ? 'active' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}
    </div>
    ${body}
    <div class="modal-actions"><button class="btn ghost" id="pa-exit">退出家长区</button></div>
  `);

  $$('[data-tab]').forEach(b => { b.onclick = () => { parentTab = b.dataset.tab; renderParentArea(); }; });
  $('#pa-exit').onclick = () => { closeModal(); renderApp(); };
  bindParentTab();
}

/* ============ 语音诊断面板（排障用：朗读引擎链/识别引擎/麦克风/模型） ============ */

function renderVoiceDiag() {
  const hasSynth = 'speechSynthesis' in global;
  const voices = hasSynth ? (global.speechSynthesis.getVoices() || []) : [];
  const enVoices = voices.filter(v => /^en(-|_)/i.test(v.lang));
  const hasRec = speechRecognitionSupported();
  const micOk = mediaRecorderSupported();
  const modeText = {
    idle: '尚未朗读（先在学习页或阅读页点一次朗读）',
    sys: '系统 TTS（平板本地引擎，离线）',
    online: '在线发音（有道，需联网）',
    error: '失败',
  }[ttsStatus.mode] || ttsStatus.mode;

  return `
    <h4>语音诊断</h4>
    <p class="muted">以下信息用于排查朗读/跟读问题。截图发维护者即可定位。</p>
    <div class="diag-box">
      <div class="diag-row"><b>当前朗读通道：</b>${esc(modeText)}${ttsStatus.lastError ? '（' + esc(ttsStatus.lastError) + '）' : ''}</div>
      <div class="diag-row"><b>speechSynthesis API：</b>${hasSynth ? '存在' : '不存在'}</div>
      <div class="diag-row"><b>系统音色总数：</b>${voices.length}${enVoices.length ? '（英文 ' + enVoices.length + ' 个，首选 ' + esc(String((pickVoice() || {}).name || '无')) + '）' : '（无英文音色 → 系统 TTS 通道不可用，将走在线发音）'}</div>
      <div class="diag-row"><b>本会话判定：</b>${netTTS ? '系统 TTS 不可用，已转在线发音' : '优先系统 TTS'}</div>
      <div class="diag-row"><b>在线识别（Web Speech）：</b>${hasRec ? '可用' : '不可用（将走 Vosk 离线识别）'}</div>
      <div class="diag-row"><b>Vosk 离线识别：</b>${voskBroken ? '加载失败（' + esc(voskModel ? '已就绪' : '未就绪') + '）' : (voskModel ? '已就绪（模型在本地）' : (voskLoading ? '加载中…' : '未加载（首次跟读时下载）'))}</div>
      <div class="diag-row"><b>麦克风 API：</b>${micOk ? '可用' : '不可用（跟读评分与录音回放需要它）'}</div>
    </div>
    <div class="modal-actions">
      <button class="btn" id="diag-test-tts">🔊 试听单词朗读</button>
      <button class="btn ghost" id="diag-test-online">🌐 强制试听在线发音</button>
    </div>
    <h4 style="margin-top:16px">最近语音事件日志</h4>
    <p class="muted">朗读/跟读/模型每一步的留痕（最近 30 条）。排查无声、卡住问题时，点"复制日志"发维护者。</p>
    <div class="diag-box" id="diag-voice-log" style="max-height:180px;overflow-y:auto;font-size:12px;line-height:1.8">
      ${voiceLog.length ? voiceLog.map(l => '<div class="diag-row">' + esc(l) + '</div>').join('') : '<div class="diag-row">（暂无事件：去学习页点一次朗读，或点上方试听按钮，再回来刷新）</div>'}
    </div>
    <div class="modal-actions">
      <button class="btn small ghost" id="diag-copy-log">📋 复制日志</button>
      <button class="btn small ghost" id="diag-refresh-log">↻ 刷新</button>
    </div>
    <p class="muted" style="margin-top:8px">提示：安卓系浏览器的 speechSynthesis 多绑定谷歌 TTS 组件；无谷歌服务的设备上即使系统设置了讯飞/华为引擎，浏览器内也可能不出声——此时应用自动改用在线发音。</p>`;
}

function bindVoiceDiag() {
  const b1 = $('#diag-test-tts');
  if (b1) b1.onclick = () => {
    setTTSStatus('idle');
    vlog('诊断面板：手动试听单词朗读');
    speak('hello');
  };
  const b2 = $('#diag-test-online');
  if (b2) b2.onclick = () => {
    netTTSAudio = null;
    vlog('诊断面板：手动强制试听在线发音');
    speakOnline('hello', null);
    renderParentArea();
  };
  const bc = $('#diag-copy-log');
  if (bc) bc.onclick = () => {
    const text = voiceLog.join('\n') || '（空）';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => { bc.textContent = '✓ 已复制'; setTimeout(() => { bc.textContent = '📋 复制日志'; }, 1500); },
        () => { alert('复制失败，请截图本页'); }
      );
    } else {
      alert('此浏览器不支持一键复制，请截图本页');
    }
  };
  const br = $('#diag-refresh-log');
  if (br) br.onclick = () => renderParentArea();
}

/* ============ 离线发音包面板（第 1 层离线语音：2696 词 amy 音色） ============ */

function renderAudioPackPanel() {
  const wa = typeof global.WordAudio !== 'undefined' ? global.WordAudio : null;
  const st = wa ? wa.status : { installed: false, count: 0 };
  const totalWords = state.words.length;
  const pct = st.count ? Math.round(st.count / totalWords * 100) : 0;
  return `
    <h4>离线发音包</h4>
    <p class="muted">下载全部 ${totalWords} 个单词的标准读音 + 全部阅读文章朗读（amy 音色，约 21MB，下载一次永久离线）。
    安装后学习卡片/跟读示范读音、阅读文章朗读不再依赖网络，与离线识别模型配合实现完全离线学习。</p>
    <div class="diag-box">
      <div class="diag-row"><b>状态：</b>${st.installed
        ? '✅ 已安装（' + st.count + ' 词，' + (st.voice || 'amy') + ' 音色）'
        : '⬜ 未安装（当前示范读音走系统 TTS / 在线发音）'}</div>
      ${st.installed ? `<div class="diag-row"><b>覆盖率：</b>${st.count}/${totalWords}（${pct}%）</div>` : ''}
    </div>
    <div id="audio-pack-progress" style="margin-top:8px"></div>
    <div class="modal-actions">
      ${st.installed
        ? `<button class="btn" id="ap-update">检查更新</button>
           <button class="btn danger" id="ap-delete">删除离线发音包</button>`
        : `<button class="btn" id="ap-download">⬇ 下载离线发音包（约 20MB）</button>`}
    </div>
    <p class="muted" style="margin-top:10px">建议在 Wi-Fi 下下载。下载过程可随时关闭页面，下次继续。</p>`;
}

function bindAudioPackPanel() {
  const btnDl = $('#ap-download');
  const btnUp = $('#ap-update');
  const btnDel = $('#ap-delete');
  const box = $('#audio-pack-progress');

  /* 打开面板时后台刷新一次状态：仅当显示的"已安装/未安装"与实际不符时
   * 重渲染（无条件 renderParentArea 会无限循环——重渲染又绑定本函数，
   * 又刷新又重渲染，modal DOM 反复重建导致无法交互，v1.2.4 修复） */
  const wa0 = typeof global.WordAudio !== 'undefined' ? global.WordAudio : null;
  if (wa0 && wa0.refreshStatus) {
    const shownInstalled = wa0.status.installed;
    wa0.refreshStatus().then(() => {
      if (wa0.status.installed !== shownInstalled) renderParentArea();
    }).catch(() => {});
  }

  const run = (mode) => {
    const wa = global.WordAudio;
    if (!wa) { alert('离线发音模块未加载（wordaudio.js 缺失）'); return; }
    if (btnDl) btnDl.disabled = true;
    if (btnUp) btnUp.disabled = true;
    box.innerHTML = '<div class="muted">准备下载…</div>';
    wa.ensureWordAudioPack(info => {
      if (info.stage === 'downloading') {
        box.innerHTML = `<div class="muted">下载中：${info.pct}%（第 ${info.part}/${info.parts} 卷，${(info.loaded / 1048576).toFixed(1)}/${(info.total / 1048576).toFixed(1)} MB）</div>
          <div class="progress"><div style="width:${info.pct}%"></div></div>`;
      } else if (info.stage === 'installing') {
        box.innerHTML = '<div class="muted">安装到本地存储…</div>';
      } else if (info.stage === 'cached') {
        box.innerHTML = '<div class="muted">✓ 已是最新版本</div>';
      } else if (info.stage === 'ready') {
        box.innerHTML = `<div class="muted">✓ 安装完成（${info.installed} 词）</div>`;
      }
    }).then(() => {
      renderParentArea();
    }).catch(err => {
      box.innerHTML = `<div class="score-bad">下载失败：${esc(err && err.message || String(err))}</div><div class="muted">可稍后重试；学习不受影响（自动回退在线发音）。</div>`;
      if (btnDl) btnDl.disabled = false;
      if (btnUp) btnUp.disabled = false;
    });
  };

  if (btnDl) btnDl.onclick = () => run('download');
  if (btnUp) btnUp.onclick = () => run('update');
  if (btnDel) btnDel.onclick = () => {
    if (!confirm('删除离线发音包？删除后示范读音回退为系统 TTS / 在线发音。')) return;
    global.WordAudio.deleteWordAudioPack().then(() => renderParentArea());
  };
}

/* 家长区各标签的事件绑定 */
function bindParentTab() {  const u = currentUser();

  if (parentTab === 'voice') {
    bindVoiceDiag();
    return;
  }

  if (parentTab === 'audio') {
    bindAudioPackPanel();
    return;
  }

  if (parentTab === 'redeem') {
    $$('[data-confirm]').forEach(b => {
      b.onclick = () => {
        const [ui, rid] = b.dataset.confirm.split(':');
        const usr = state.users[Number(ui)];
        const r = usr.redemptions.find(x => x.id === rid);
        if (!r) return;
        /* 确认时检查余额；同时复核周/月上限 */
        const reward = state.rewards.find(x => x.id === r.rewardId);
        if (usr.points < r.points) {
          r.status = 'rejected';
          saveState();
          alert(`${usr.name} 积分不足（${usr.points}/${r.points}），已自动拒绝。`);
        } else if (reward &&
          ((reward.limitWeek > 0 && redemptionCount(usr, r.rewardId, startOfWeekTs()) >= reward.limitWeek) ||
           (reward.limitMonth > 0 && redemptionCount(usr, r.rewardId, startOfMonthTs()) >= reward.limitMonth))) {
          r.status = 'rejected';
          saveState();
          alert('该奖励已达每周/每月上限，已拒绝。');
        } else {
          r.status = 'confirmed';
          usr.points -= r.points;
          /* 兑换扣分记录到该学生事件流 */
          const backupActive = state.activeUser;
          state.activeUser = Number(ui);
          logEvent('redemption', null, { points: -r.points, correct: null });
          state.activeUser = backupActive;
          saveState();
          alert('兑换已确认。');
        }
        renderParentArea();
        renderApp();
      };
    });
    $$('[data-reject]').forEach(b => {
      b.onclick = () => {
        const [ui, rid] = b.dataset.reject.split(':');
        const usr = state.users[Number(ui)];
        const r = usr.redemptions.find(x => x.id === rid);
        if (r) { r.status = 'rejected'; saveState(); }
        renderParentArea();
      };
    });
  }

  else if (parentTab === 'students') {
    $('#stu-save').onclick = () => {
      state.users.forEach((usr, i) => {
        const name = $(`[data-uname="${i}"]`).value.trim();
        if (name) usr.name = name;
        const rv = parseInt($(`[data-urev="${i}"]`).value, 10);
        if (rv >= 0 && rv <= 200) usr.reviewLimit = rv;
      });
      saveState();
      alert('学生设置已保存。');
      renderApp();
      renderParentArea();
    };
    const addBtn = $('#stu-add');
    if (addBtn) addBtn.onclick = openAddStudentModal;
  }

  else if (parentTab === 'scope') {
    $$('[data-sgrade]').forEach(el => {
      el.onclick = () => {
        const gid = el.dataset.sgrade;
        const usr = currentUser();
        if (usr.scopeGrades.includes(gid)) {
          usr.scopeGrades = usr.scopeGrades.filter(x => x !== gid);
          usr.scopeUnits = usr.scopeUnits.filter(x => !x.startsWith(gid + '-'));
        } else {
          usr.scopeGrades.push(gid);
        }
        saveState();
        renderParentArea();
      };
    });
    $$('[data-sunit]').forEach(el => {
      el.onclick = () => {
        const uid2 = el.dataset.sunit;
        const usr = currentUser();
        const gid = uid2.split('-')[0] + '-' + uid2.split('-')[1]; /* g7a-u1 -> g7a */
        const fullGrade = usr.scopeGrades.includes(gid) && !usr.scopeUnits.length;
        if (fullGrade) {
          /* 整学年已选：切换为全选 + 取消该单元 */
          usr.scopeUnits = state.units.filter(un => un.gradeId === gid && un.id !== uid2).map(un => un.id);
        } else if (usr.scopeUnits.includes(uid2)) {
          usr.scopeUnits = usr.scopeUnits.filter(x => x !== uid2);
        } else {
          if (!usr.scopeGrades.includes(gid)) usr.scopeGrades.push(gid);
          usr.scopeUnits.push(uid2);
        }
        saveState();
        renderParentArea();
      };
    });
  }

  else if (parentTab === 'rewards') {
    $$('[data-editreward]').forEach(b => {
      b.onclick = () => openRewardEditor(state.rewards.find(r => r.id === b.dataset.editreward));
    });
    $('#reward-add').onclick = () => openRewardEditor(null);
  }

  else if (parentTab === 'words') {
    renderParentWordList('');
    let kwTimer = null;
    $('#w-kw').oninput = e => {
      clearTimeout(kwTimer);
      const kw = e.target.value;
      kwTimer = setTimeout(() => renderParentWordList(kw), 300);
    };
    $('#w-add').onclick = () => openWordEditor(null);
    $('#w-addunit').onclick = () => openUnitEditor();
    /* 按学年导入 Excel 词库 */
    let importGradeId = null;
    $$('[data-wimport]').forEach(b => {
      b.onclick = () => {
        const gid = b.dataset.wimport;
        const grade = state.grades.find(g => g.id === gid);
        const nWords = state.words.filter(w => {
          const un = state.units.find(x => x.id === w.unitId);
          return un && un.gradeId === gid;
        }).length;
        const msg = nWords
          ? `导入将替换「${grade.title}」现有的 ${nWords} 个单词和全部单元，该学年相关的学习进度会一并清除。`
          : `将向「${grade.title}」导入 Excel 中的单词。`;
        if (!confirm(msg + '\n建议先在“数据备份”中导出备份。继续吗？')) return;
        importGradeId = gid;
        $('#w-import-file').value = '';
        $('#w-import-file').click();
      };
    });
    $('#w-import-file').onchange = e => {
      const file = e.target.files[0];
      if (!file || !importGradeId) return;
      importGradeExcel(importGradeId, file, () => {
        renderParentArea(); /* 重新渲染词库管理页 */
        renderApp();
      });
    };
  }

  else if (parentTab === 'backup') {
    $('#bk-export').onclick = exportBackup;
    $('#bk-import').onclick = () => $('#bk-file').click();
    $('#bk-file').onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          if (!imported || !Array.isArray(imported.users) || !imported.users.length) {
            throw new Error('格式不正确');
          }
          state = normalizeState(imported);
          if (state.activeUser >= state.users.length) state.activeUser = 0;
          saveState();
          alert('导入成功。');
          closeModal();
          renderApp();
        } catch (err) {
          alert('导入失败：' + err.message);
        }
      };
      reader.readAsText(file);
    };
    $('#bk-savepwd').onclick = () => {
      const p1 = $('#bk-newpwd').value;
      const p2 = $('#bk-newpwd2').value;
      if (!p1) { alert('密码不能为空。'); return; }
      if (p1 !== p2) { alert('两次输入的密码不一致。'); return; }
      state.settings.parentPassword = p1;
      saveState();
      alert('家长密码已修改。');
      $('#bk-newpwd').value = ''; $('#bk-newpwd2').value = '';
    };
    $$('[data-clearuser]').forEach(el => {
      el.onclick = () => el.classList.toggle('on');
    });
    $('#bk-clear-learning').onclick = () => {
      const picked = $$('[data-clearuser]').filter(el => el.classList.contains('on'))
        .map(el => Number(el.dataset.clearuser));
      if (!picked.length) { alert('请至少勾选一个学生。'); return; }
      const names = picked.map(i => '“' + state.users[i].name + '”').join('、');
      if (!confirm(`确定清除 ${names} 的学习数据（进度、记录、积分、兑换）？词库和设置会保留。`)) return;
      if (!confirm('再次确认：清除后学习进度无法恢复，如需保留请先导出备份。')) return;
      clearLearningData(picked);
      alert('已清除勾选学生的学习数据。');
      closeModal();
      releaseFollowRead();
      session = null;
      renderApp();
    };
    $('#bk-factory-reset').onclick = () => {
      if (!confirm('确定恢复出厂设置？全部数据（含词库修改、奖励、家长密码）将恢复为初始状态。')) return;
      if (!confirm('最后确认：此操作不可恢复，建议先导出备份。继续吗？')) return;
      factoryReset();
      alert('已恢复出厂设置。家长密码恢复为 1234。');
      closeModal();
      releaseFollowRead();
      session = null;
      renderApp();
    };
  }
}

/* 清除学习数据（13.4）：按学生索引清除进度、记录、积分、兑换；
 * 保留姓名、每日词数、背诵范围等设置和词库、奖励、密码。
 * 不传参数 = 清除全部学生。 */
function clearLearningData(userIdxs) {
  const targets = userIdxs == null
    ? state.users.map((_, i) => i)
    : userIdxs;
  targets.forEach(i => {
    const u = state.users[i];
    if (!u) return;
    u.wordStates = {};
    u.history = [];
    u.redemptions = [];
    u.points = 0;
    delete u.dailyTaskSnapshot; /* 清除当天任务快照，下次重新生成 */
  });
  /* 当前学生被清除时，切到第一个未清除的学生（保持数据一致性） */
  if (targets.includes(state.activeUser)) {
    const kept = state.users.map((_, i) => i).filter(i => !targets.includes(i));
    state.activeUser = kept.length ? kept[0] : 0;
    releaseFollowRead();
    session = null;
  }
  saveState();
}

/* 恢复出厂设置：重建初始状态（含默认词库、奖励、密码 1234） */
function factoryReset() {
  state = buildBaseState();
  saveState();
}

/* 家长区词库列表：按学年分组渲染 */
function renderParentWordList(kw) {
  const unitById = {};
  state.units.forEach(un => { unitById[un.id] = un; });
  const k = kw.trim().toLowerCase();

  state.grades.forEach(g => {
    const holder = $('#w-list-' + g.id);
    if (!holder) return;
    const unitIds = new Set(state.units.filter(un => un.gradeId === g.id).map(un => un.id));
    const list = state.words.filter(w => {
      if (!unitIds.has(w.unitId)) return false;
      if (!k) return true;
      const un = unitById[w.unitId];
      return w.text.toLowerCase().includes(k) || (w.meaning || '').toLowerCase().includes(k) ||
        (un && un.title.toLowerCase().includes(k));
    }).slice(0, 100);

    holder.innerHTML = list.length ? `
      ${k ? `<p class="muted">显示 ${list.length} 条（筛选中）</p>` : `<p class="muted">显示前 ${list.length} 条</p>`}
      <table>
        <thead><tr><th>单词</th><th>释义</th><th>单元</th><th>操作</th></tr></thead>
        <tbody>
          ${list.map(w => `<tr class="${w.enabled ? '' : 'disabled-row'}">
            <td>${esc(w.text)}</td><td>${esc(w.meaning)}</td>
            <td class="muted">${esc(unitById[w.unitId] ? unitById[w.unitId].title : w.unitId)}</td>
            <td class="row">
              <button class="btn small ghost" data-wedit="${w.id}">编辑</button>
              <button class="btn small ${w.enabled ? 'danger' : 'success'}" data-wtoggle="${w.id}">${w.enabled ? '停用' : '启用'}</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<p class="muted">${k ? '没有符合筛选的单词' : '该学年暂无单词，点击上方“导入词库文件”或“新增单词”'}</p>`;

    $$('[data-wedit]', holder).forEach(b => { b.onclick = () => openWordEditor(state.words.find(w => w.id === b.dataset.wedit)); });
    $$('[data-wtoggle]', holder).forEach(b => {
      b.onclick = () => {
        const w = state.words.find(x => x.id === b.dataset.wtoggle);
        if (w) { w.enabled = !w.enabled; saveState(); renderParentWordList(kw); }
      };
    });
  });
}

/* 6.3 Excel 行解析（纯函数，供测试）：输入 sheet_to_json(header:1) 的行数组，
 * 输出 { unitOrder, wordCount, skipped }。列结构：[序号,单元,单词,音标,词性,释义] */
function parseWordRows(rows) {
  const unitOrder = [];
  const unitMap = {};
  let wordCount = 0;
  let skipped = 0;
  if (!rows || rows.length < 2) return { unitOrder, wordCount, skipped };
  rows.slice(1).forEach(r => {
    if (!Array.isArray(r)) return;
    const unitTitle = String(r[1] || '').trim();
    const text = String(r[2] || '').trim();
    const phon = String(r[3] || '').trim();
    const pos = String(r[4] || '').trim();
    const meaning = String(r[5] || '').trim();
    if (!unitTitle || !text || !meaning) { if (unitTitle || text) skipped++; return; }
    if (!unitMap[unitTitle]) {
      unitMap[unitTitle] = { title: unitTitle, words: [] };
      unitOrder.push(unitMap[unitTitle]);
    }
    unitMap[unitTitle].words.push({ text, phon, pos, meaning });
    wordCount++;
  });
  return { unitOrder, wordCount, skipped };
}

/* 6.3 将解析结果写入指定学年（替换该学年单元与单词，清理失效进度） */
function applyGradeImport(gradeId, parsed) {
  const grade = state.grades.find(g => g.id === gradeId);
  if (!grade) throw new Error('学年不存在');

  const removedUnitIds = new Set(state.units.filter(un => un.gradeId === gradeId).map(un => un.id));
  state.units = state.units.filter(un => un.gradeId !== gradeId);
  state.words = state.words.filter(w => !removedUnitIds.has(w.unitId));

  parsed.unitOrder.forEach((un, i) => {
    const unitId = gradeId + '-u' + (i + 1);
    state.units.push({ id: unitId, gradeId, title: un.title });
    un.words.forEach((w, wi) => {
      state.words.push({
        id: unitId + '-' + (wi + 1),
        text: w.text, pos: w.pos, meaning: w.meaning,
        phon: w.phon, example: '',
        unitId, enabled: true,
      });
    });
  });

  /* 学生进度中指向被删词的状态一并清理；单元细分勾选同步清空该学年 */
  state.users.forEach(usr => {
    const alive = {};
    state.words.forEach(w => { if (usr.wordStates[w.id]) alive[w.id] = usr.wordStates[w.id]; });
    usr.wordStates = alive;
    usr.scopeUnits = usr.scopeUnits.filter(x => !x.startsWith(gradeId + '-u'));
  });
  _grammarTextCache = null; /* 词库已变：易混词语法缓存失效（7.4.1） */
  saveState();
  return { units: parsed.unitOrder.length, words: parsed.wordCount, skipped: parsed.skipped };
}

/* 6.3 Excel 词库导入入口：读取文件 → 解析 → 写入学年 */
function importGradeExcel(gradeId, file, onDone) {
  if (typeof XLSX === 'undefined') {
    alert('词库导入组件未加载（vendor-xlsx.js 缺失）。');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const parsed = parseWordRows(rows);
      if (!parsed.wordCount) throw new Error('没有解析到有效单词（需要列：单元、单词、音标、词性、释义）');
      const result = applyGradeImport(gradeId, parsed);
      const grade = state.grades.find(g => g.id === gradeId);
      alert(`导入完成：${grade.title} 共 ${result.units} 个单元、${result.words} 个单词` +
        (result.skipped ? `（跳过 ${result.skipped} 行不完整数据）` : '') + '。该学年原有单词已被替换。');
      if (onDone) onDone();
    } catch (err) {
      alert('导入失败：' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

/* 单词编辑弹窗 */
function openWordEditor(w) {
  const isNew = !w;
  openModal(`
    <h3>${isNew ? '新增单词' : '编辑单词'}</h3>
    <div class="form-row"><label>英文</label><input type="text" id="we-text" value="${esc(w ? w.text : '')}"></div>
    <div class="form-row"><label>音标（可选）</label><input type="text" id="we-phon" value="${esc(w ? w.phon || '' : '')}" placeholder="/ɡʊd/"></div>
    <div class="form-row"><label>词性</label><input type="text" id="we-pos" value="${esc(w ? w.pos : '')}" placeholder="n. / v. / adj."></div>
    <div class="form-row"><label>中文释义</label><input type="text" id="we-meaning" value="${esc(w ? w.meaning : '')}"></div>
    <div class="form-row"><label>例句（可选，用于学习页展示）</label><input type="text" id="we-example" value="${esc(w ? w.example || '' : '')}"></div>
    <div class="form-row"><label>单元</label>
      <select id="we-unit">
        ${state.units.map(un => {
          const g = state.grades.find(x => x.id === un.gradeId);
          return `<option value="${un.id}" ${w && w.unitId === un.id ? 'selected' : ''}>${esc(g ? g.title : '')} / ${esc(un.title)}</option>`;
        }).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn ghost" id="we-cancel">取消</button>
      <button class="btn" id="we-ok">保存</button>
    </div>
  `);
  $('#we-cancel').onclick = renderParentArea;
  $('#we-ok').onclick = () => {
    const text = $('#we-text').value.trim();
    const meaning = $('#we-meaning').value.trim();
    if (!text || !meaning) { alert('英文和释义不能为空。'); return; }
    const data = {
      text, meaning,
      phon: $('#we-phon').value.trim(),
      pos: $('#we-pos').value.trim() || '',
      example: $('#we-example').value.trim(),
      unitId: $('#we-unit').value,
    };
    if (isNew) {
      state.words.push(Object.assign({ id: uid('w'), enabled: true }, data));
    } else {
      Object.assign(w, data);
    }
    _grammarTextCache = null; /* 词库已变：易混词语法缓存失效（7.4.1） */
    saveState();
    alert('已保存。');
    renderParentArea();
  };
}

/* 单元编辑弹窗 */
function openUnitEditor() {
  openModal(`
    <h3>新增单元</h3>
    <div class="form-row"><label>学年</label>
      <select id="ue-grade">${state.grades.map(g => `<option value="${g.id}">${esc(g.title)}</option>`).join('')}</select>
    </div>
    <div class="form-row"><label>单元名称</label><input type="text" id="ue-title" placeholder="例如：旅行与交通"></div>
    <div class="modal-actions">
      <button class="btn ghost" id="ue-cancel">取消</button>
      <button class="btn" id="ue-ok">保存</button>
    </div>
  `);
  $('#ue-cancel').onclick = renderParentArea;
  $('#ue-ok').onclick = () => {
    const title = $('#ue-title').value.trim();
    if (!title) { alert('单元名称不能为空。'); return; }
    const gradeId = $('#ue-grade').value;
    const n = state.units.filter(un => un.gradeId === gradeId).length + 1;
    state.units.push({ id: gradeId + '-u' + n + '-' + Math.random().toString(36).slice(2, 6), gradeId, title });
    saveState();
    alert('单元已新增，可在新增单词时选择它。');
    renderParentArea();
  };
}

/* 奖励编辑弹窗 */
function openRewardEditor(r) {
  const isNew = !r;
  openModal(`
    <h3>${isNew ? '新增奖励' : '编辑奖励'}</h3>
    <div class="form-row"><label>名称</label><input type="text" id="re-name" value="${esc(r ? r.name : '')}"></div>
    <div class="form-row"><label>所需积分</label><input type="number" id="re-points" value="${r ? r.points : 100}" min="10" step="10"></div>
    <div class="row">
      <div class="form-row"><label>每周上限（0 不限）</label><input type="number" id="re-lw" value="${r ? r.limitWeek : 1}" min="0" style="width:100px"></div>
      <div class="form-row"><label>每月上限（0 不限）</label><input type="number" id="re-lm" value="${r ? r.limitMonth : 4}" min="0" style="width:100px"></div>
    </div>
    <div class="form-row"><label>说明</label><input type="text" id="re-note" value="${esc(r ? r.note || '' : '')}"></div>
    ${isNew ? '' : '<button class="btn small danger" id="re-del">删除该奖励</button>'}
    <div class="modal-actions">
      <button class="btn ghost" id="re-cancel">取消</button>
      <button class="btn" id="re-ok">保存</button>
    </div>
  `);
  $('#re-cancel').onclick = renderParentArea;
  $('#re-ok').onclick = () => {
    const name = $('#re-name').value.trim();
    const points = parseInt($('#re-points').value, 10);
    if (!name) { alert('名称不能为空。'); return; }
    if (!(points > 0)) { alert('积分必须大于 0。'); return; }
    const data = {
      name, points,
      limitWeek: Math.max(0, parseInt($('#re-lw').value, 10) || 0),
      limitMonth: Math.max(0, parseInt($('#re-lm').value, 10) || 0),
      note: $('#re-note').value.trim(),
    };
    if (isNew) {
      state.rewards.push(Object.assign({ id: uid('r') }, data));
    } else {
      Object.assign(r, data);
    }
    saveState();
    renderParentArea();
  };
  const del = $('#re-del');
  if (del) {
    del.onclick = () => {
      if (confirm('确定删除该奖励？已有兑换记录会保留。')) {
        state.rewards = state.rewards.filter(x => x.id !== r.id);
        saveState();
        renderParentArea();
      }
    };
  }
}

/* 备份导出 */
function exportBackup() {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'english-backup-' + todayKey() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) {
    alert('导出失败：' + e.message);
  }
}

/* ======================================================
 * 17. 初始化与导航
 * ====================================================== */

let currentPage = 'today';
const PAGES = { today: renderToday, reading: renderReading, library: renderLibrary, points: renderPoints, report: renderReport };

function renderApp() {
  $('#topbar-user-name').textContent = currentUser().name;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === currentPage));
  (PAGES[currentPage] || renderToday)();
}

function init() {
  state = loadState();
  saveState(); /* 首次运行落盘 */

  /* 启动时刷新离线音频包状态：wordaudio.status 初始 installed=false，
   * 不刷新的话 speak() 会绕过已装的音频包直接走 TTS/在线链路——
   * 离线（飞行模式）场景报"语音不可用"而音频包明明可用 */
  if (typeof global.WordAudio !== 'undefined' && global.WordAudio.refreshStatus) {
    global.WordAudio.refreshStatus().then(() => {
      if (global.WordAudio.status.installed) vlog('离线音频包已就绪（' + global.WordAudio.status.count + ' 词）');
    }).catch(() => {});
  }

  /* Vosk 引擎预热（仅模型已缓存的设备）：后台静默初始化 20-40 秒，
   * 用户点跟读时已就绪——免去每词等待。未缓存设备零流量、零动作 */
  preheatVosk();

  $$('.nav-btn').forEach(b => {
    b.onclick = () => {
      session = null; /* 切换页面放弃进行中的会话（不记完成事件） */
      releaseFollowRead();
      currentPage = b.dataset.page;
      renderApp();
    };
  });
  $('#btn-switch-user').onclick = openSwitchUserModal;
  $('#btn-parent').onclick = openParentModal;

  renderApp();
}

/* DOM 就绪后启动；Node 测试环境无 document 时跳过 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

/* PWA：注册 Service Worker（离线打开 + 添加到主屏幕）。
 * 仅在安全上下文（https 或 localhost）注册；file:// 打开时静默跳过。 */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  if (global.location && (global.location.protocol === 'https:' ||
      global.location.hostname === 'localhost' || global.location.hostname === '127.0.0.1')) {
    global.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('[pwa] Service Worker 注册失败', err);
      });
    });
  }
}

/* ======================================================
 * 18. 导出（Node 冒烟测试用）
 * ====================================================== */

const api = {
  /* 数据 */
  GRADES, RAW_UNITS, RAW_WORDS, DEFAULT_REWARDS, BUILT_IN_ARTICLES, LIB_VERSION,
  buildBaseState, normalizeState, makeUser,
  /* 工具 */
  dateKey, todayKey, addDays, keyLE, nextInterval, editDistance, similarity,
  scoreFollowRead, scoreLabel, shuffle, uid,
  speakableWordText, confusableWords, buildRecognizerGrammar, libraryTextsForGrammar,
  /* 业务 */
  applyDayResult, newWordState, buildDailyTask, scopeWordIds,
  logEvent, alreadyRewardedToday, levelOf,
  weekStartKey, monthStartKey, prevMonthRange, computePeriodStats, pctOf, buildAdvice,
  clearLearningData, factoryReset, addUser, importGradeExcel, parseWordRows, applyGradeImport,
  speak, speakArticle, speakOnline, splitForTTS, downloadModelBlob, ensureVoskModel, preheatVosk,
  generateArticle,
  _setTTSForTest(o) { netTTS = !!o.netTTS; },
  /* 跟读引擎层（回归测试用：直达 Vosk 路径的会话补建） */
  _frTest: {
    beginRecording(w, box) { beginRecording(w, box); },
    autoFollowRead,
    releaseFollowRead,
    vlog,
    get voiceLog() { return voiceLog; },
    get fr() { return fr; },
    get frGen() { return frGen; },
    get webSpeechDead() { return webSpeechDead; },
    set webSpeechDead(v) { webSpeechDead = v; },
    get voskModel() { return voskModel; },
    set voskModel(v) { voskModel = v; },
    get voskBroken() { return voskBroken; },
    set voskBroken(v) { voskBroken = v; },
    set voskLoading(v) { voskLoading = v; },
  },
  /* 测试注入 */
  _setState(s) { state = s; },
  _getState() { return state; },
  _getCurrentUser: currentUser,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
global.SevenAEnglish = api;

})(typeof window !== 'undefined' ? window : globalThis);
