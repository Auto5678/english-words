/* 初中英语背单词 - 业务逻辑与数据存储
 * 依据 system-design.md v1.1 实现。
 * 模块在浏览器中作为普通脚本执行，在 Node 中可 require 用于测试。
 */
(function (global) {
'use strict';

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

/* 单元：七年级上册与小学来自教材 Excel；其他学年预留空框架，家长可通过
 * 词库管理的“导入词库文件”按钮导入 Excel 或手动添加。 */
const RAW_UNITS = {
  gPri: GRADE_PRI_UNIT_TITLES,
  g7a: GRADE_G7A_UNIT_TITLES,
  g7b: [],
  g8a: [],
  g8b: [],
  g9a: [],
  g9b: [],
};

/* 单词：[text, pos, meaning, phon(音标)]
 * 七年级上册 318 词、小学 396 词来自教材单词表 Excel，全部带音标；
 * 例句(example)为可选字段，家长可在词库维护中补充。
 * 其他学年为空，家长可通过导入 Excel 填充。 */
const RAW_WORDS = Object.assign({}, RAW_WORDS_PRI, RAW_WORDS_G7A);




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
const LIB_VERSION = 2;

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
  const M = {
    idle: ['', ''],
    sys: ['语音引擎：系统 TTS', ''],
    online: ['语音引擎：在线发音（联网）', ''],
    error: ['朗读暂不可用', '语音不可用：系统无 TTS 引擎，在线发音失败（检查网络）。单词学习和跟读不受影响。'],
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
  const playNext = () => {
    if (token !== netTTSToken) return;
    if (i >= parts.length) {
      /* 全部播完（允许个别段失败跳过）：本次朗读成功，不清 netTTS 判定 */
      if (failures === 0 || failures < parts.length) setTTSStatus('online');
      if (onEnd) onEnd();
      return;
    }
    let a;
    try {
      a = new Audio('https://dict.youdao.com/dictvoice?type=0&audio=' + encodeURIComponent(parts[i++]));
    } catch (e) { failures++; playNext(); return; } /* 单段失败：跳过续播 */
    netTTSAudio = a;
    const guard = setTimeout(() => { try { a.pause(); } catch (e) {} a.onerror = null; a.onended = null; failures++; playNext(); }, 7000);
    a.onended = () => { clearTimeout(guard); playNext(); };
    a.onerror = () => { clearTimeout(guard); failures++; playNext(); };
    a.play().catch(() => { clearTimeout(guard); failures++; playNext(); });
  };
  playNext();
}

function speak(text, onEnd) {
  if (!text) { if (onEnd) onEnd(); return; }

  const myToken = ++speakToken;
  /* 新朗读开始：截断仍在播的在线语音（防止与本次朗读混音） */
  if (netTTSAudio) { try { netTTSAudio.pause(); } catch (e) {} netTTSAudio = null; netTTSToken++; }

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

/* 7.4 跟读评分：0-100 */
function scoreFollowRead(target, transcript, confidence) {
  const t = (transcript || '').trim().toLowerCase().replace(/[^a-z\s]/g, '');
  const w = (target || '').trim().toLowerCase();
  if (!t) return 0;                       /* 识别不到发音 */
  const conf = typeof confidence === 'number' && confidence > 0 ? Math.min(confidence, 1) : 0.6;
  const tokens = t.split(/\s+/).filter(Boolean);
  let bestSim = 0;
  tokens.forEach(tok => {
    const s = similarity(w, tok);
    if (s > bestSim) bestSim = s;
  });
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

  const goRecord = () => {
    if (gen !== frGen) return; /* 已切词 */
    beginRecording(w, box);
  };
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
let voskModelParts = [
  'https://cdn.jsdelivr.net/gh/Auto5678/english-words@main/model-cdn/vosk-model.part1',
  'https://cdn.jsdelivr.net/gh/Auto5678/english-words@main/model-cdn/vosk-model.part2',
  'https://cdn.jsdelivr.net/gh/Auto5678/english-words@main/model-cdn/vosk-model.part3',
];
let voskPartsTotal = 41138088; /* 三卷总字节（split-model.js 实测；仅进度显示用，以响应头为准） */
const VOSK_CACHE_KEY = 'vosk-model-blob-v1'; /* Cache API 中的完整模型条目 */

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

async function fetchModelPart(url, onBytes) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' @ ' + url.split('/').pop());
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
  /* 合并分卷内部块 */
  const out = new Uint8Array(got);
  let off = 0;
  chunks.forEach(c => { out.set(c, off); off += c.length; });
  return out;
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

  /* 3) 分卷下载（jsDelivr） */
  const buffers = [];
  let loaded = 0;
  for (let i = 0; i < voskModelParts.length; i++) {
    const buf = await fetchModelPart(voskModelParts[i], (partGot) => {
      if (onProgress) onProgress({
        stage: 'downloading',
        part: i + 1,
        parts: voskModelParts.length,
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

  /* 4) 写入 Cache API 供下次秒加载（失败不影响本次） */
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('vosk-model');
      await cache.put(VOSK_CACHE_KEY, new Response(blob));
    } catch (e) {}
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
  if (voskLoading) return voskLoading;

  if (typeof global.Vosk === 'undefined') {
    /* index.html 已同步引入 vendor-vosk.js；若将来改为按需加载，可在此动态注入 */
    voskBroken = true;
    return Promise.reject(new Error('vosk-script-missing'));
  }

  const progress = typeof onProgress === 'function' ? onProgress : null;
  voskLoading = downloadModelBlob(progress).then(blobUrl => {
    if (progress) progress({ stage: 'extracting' });
    return global.Vosk.createModel(blobUrl, 0);
  }).then(model => {
    voskModel = model;
    voskLoading = null;
    if (progress) progress({ stage: 'ready' });
    return model;
  }, err => {
    voskBroken = true; /* 本次失败；下一次点跟读重新尝试（不清 voskLoading 复用变量语义） */
    voskLoading = null;
    console.warn('[vosk] 模型加载失败', err);
    throw (err instanceof Error ? err : new Error('vosk-load-failed'));
  });
  return voskLoading;
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

  rec.onresult = e => {
    gotResult = true;
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
    clearTimeout(timer);
    stopSharedRecorder();
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

function switchToVosk(w, box, why) {
  if (fr) fr.switching = true;
  stopSharedRecorder();
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
    <p class="muted" style="margin-top:6px">可能原因：网络不稳（模型从 CDN 下载，约 41MB）或存储空间不足。</p>
    <button class="btn small" id="btn-vosk-retry">↻ 重试下载</button>`;
    const btn = $('#btn-vosk-retry');
    if (btn) btn.onclick = () => {
      voskBroken = false; /* 解除判死，允许重新加载 */
      voskLoading = null;
      result.innerHTML = '';
      switchToVosk(currentSessionWord(), box, '正在重新下载模型…');
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
    box.innerHTML = `
      下载完成，正在解压模型（约 20-40 秒，此后永久离线可用）…
      <div class="model-progress indeterminate"><div></div></div>`;
  } else if (info.stage === 'cached') {
    box.textContent = '模型已缓存，正在启动识别…';
  } else if (info.stage === 'ready') {
    box.textContent = '请跟读…';
  }
}

function beginVoskRecording(w, box) {
  return ensureVoskModel(info => {
    renderModelProgress(box, info);
  }).then(model => {
    if (!fr || fr.wordId !== w.id || !fr.busy) return; /* 期间已切词 */

    box.textContent = '请跟读…（最长 6 秒）';
    attachSharedRecording(w); /* 与识别并行的 MediaRecorder 录音（回放用） */

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
        if (!fr || fr.wordId !== w.id || !fr.busy) {
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

        recognizer = new model.KaldiRecognizer(audioCtx.sampleRate, JSON.stringify(['[unk]', w.text.toLowerCase()]));
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
            if (!fr || fr.wordId !== w.id || !fr.busy) { cleanup(); stream.getTracks().forEach(t => t.stop()); resolve(); return; }
            node = new AudioWorkletNode(audioCtx, 'fr-proc');
            node.port.onmessage = e => feed(new Float32Array(e.data));
            src.connect(node);
            node.connect(mute);
          }).catch(() => {
            if (!fr || fr.wordId !== w.id || !fr.busy) { cleanup(); stream.getTracks().forEach(t => t.stop()); resolve(); return; }
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

/* 引擎入口：有 Web Speech 用 Web Speech，否则 Vosk */
function beginRecording(w, box) {
  if (speechRecognitionSupported()) {
    beginWebSpeech(w, box);
  } else {
    switchToVosk(w, box, '正在启动离线识别…');
  }
}

function finishFollowRead(w, score, transcript, confidence) {
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
function generateArticle(wordTexts) {
  const parts = [];
  const n = wordTexts.length;
  const openers = ['Today I learned some new words.', 'This is my English story.', 'Let me tell you about my day.'];
  parts.push(openers[Math.floor(Math.random() * openers.length)]);
  wordTexts.forEach((wd, i) => {
    const tmpl = [
      `I saw the word "${wd}" in my book, and I wrote it down.`,
      `My teacher said "${wd}" is easy to remember.`,
      `I use the word "${wd}" when I talk with my friends.`,
      `Can you make a sentence with the word "${wd}"?`,
      `The word "${wd}" is very useful in English.`,
    ];
    parts.push(tmpl[i % tmpl.length]);
  });
  parts.push(n > 5 ? 'These words help me read and write. English is fun!' : 'I will review them tomorrow. See you!');
  return parts.join(' ');
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

  let title, text, targets;
  if (best && bestCover > 0) {
    title = best.title; text = best.text; targets = best.words.filter(t => targetSet.has(t.toLowerCase()));
  } else {
    title = '今日练习短文'; text = generateArticle(newWordTexts); targets = newWordTexts;
  }
  return { title, text, targets, quizPool: targets.length ? targets : newWordTexts };
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

  let title, text, targets;
  if (best && bestCover > 0) {
    title = best.title; text = best.text; targets = best.words.filter(t => targetSet.has(t.toLowerCase()));
  } else {
    title = '本周练习文章'; text = generateArticle(weekWordTexts.slice(0, 20)); targets = weekWordTexts.slice(0, 20);
  }
  return { title, text, targets, quizPool: targets.length ? targets : weekWordTexts };
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

  $('#btn-read-daily').onclick = () => speak(daily.text);
  $('#btn-quiz-daily').onclick = () => openReadingQuiz(daily, 'article', 5);
  if (weeklyOK) {
    const wk = pickWeeklyArticle();
    $('#btn-read-weekly').onclick = () => speak(wk.text);
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
    ['voice', '语音诊断'],
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
    <p class="muted" style="margin-top:8px">提示：安卓系浏览器的 speechSynthesis 多绑定谷歌 TTS 组件；无谷歌服务的设备上即使系统设置了讯飞/华为引擎，浏览器内也可能不出声——此时应用自动改用在线发音。</p>`;
}

function bindVoiceDiag() {
  const b1 = $('#diag-test-tts');
  if (b1) b1.onclick = () => {
    setTTSStatus('idle');
    speak('hello');
  };
  const b2 = $('#diag-test-online');
  if (b2) b2.onclick = () => {
    netTTSAudio = null;
    speakOnline('hello', null);
    renderParentArea();
  };
}

/* 家长区各标签的事件绑定 */
function bindParentTab() {
  const u = currentUser();

  if (parentTab === 'voice') {
    bindVoiceDiag();
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
  GRADES, RAW_UNITS, RAW_WORDS, DEFAULT_REWARDS, BUILT_IN_ARTICLES,
  buildBaseState, normalizeState, makeUser,
  /* 工具 */
  dateKey, todayKey, addDays, keyLE, nextInterval, editDistance, similarity,
  scoreFollowRead, scoreLabel, shuffle, uid,
  /* 业务 */
  applyDayResult, newWordState, buildDailyTask, scopeWordIds,
  logEvent, alreadyRewardedToday, levelOf,
  weekStartKey, monthStartKey, prevMonthRange, computePeriodStats, pctOf, buildAdvice,
  clearLearningData, factoryReset, addUser, importGradeExcel, parseWordRows, applyGradeImport,
  speak, speakOnline, splitForTTS, downloadModelBlob, ensureVoskModel,
  _setTTSForTest(o) { netTTS = !!o.netTTS; },
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
