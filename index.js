//以下变量需要在多个函数中使用
var tips = document.querySelector('.tips');
var tipsText = document.querySelector('.tips p');
var tipsBtn = document.getElementsByClassName('tips-btn')[0];
var resetBtn = document.querySelector('#resetBtn');
var modal = document.querySelector('.modal');
var pageSize = 14;
var nowPage = 1;
var allPage = 1;
var pageMsg = document.getElementById('page-msg');
tipsBtn.onclick = function () {
    tips.style.display = "none";
    resetBtn.click();
}
/**
 * 
 * @param {String} type 请求方式
 * @param {String} url    请求地址
 * @param {String} data   请求数据  key=value&key1=value1
 * @param {Function} cb     成功的回调函数
 * @param {Boolean} isAsync 是否异步 true
 */
function ajax(type, url, readyData, cb, isAsync) {
    // get   url + '?' + readyData
    // post 
    // console.log(type,url,readyData, cb, isAsync)
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                cb(JSON.parse(xhr.responseText))
            }
        }
    }
    if (type == 'GET') {
        xhr.open(type, url + '?' + readyData, isAsync);
        xhr.send();
        // console.log('ajax ready get')
    } else if (type == 'POST') {
        xhr.open(type, url, isAsync);
        // key=value&key1=valu1
        // 设置请求头：| 哪一项？ | 何种方式？
        //            | 消息主题 | 应用层-万维网-表单类型-url编码
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(readyData);
    }
}

/**
 * @param bindEvent 是一个绑定事件函数的集合，用来存放所有与事件绑定有关的函数
 * 
 * 1.该函数执行时，里边的所有事件都会绑定完成
 * 
 * 2.绑定事件必需的dom元素获取写在事件绑定函数的前边
 */
function bindEvent() {
    //先绑定左侧边栏与右侧内容区域，使他们一一对应
    var menu = document.getElementsByClassName('menu')[0];
    menu.onclick = function (e) {
        if (e.target.tagName === 'DD') {
            var id = e.target.dataset.id
            var content = document.getElementById(id);//左侧边栏data-id与我们右侧内容的id是一样的，所以可以这样选取到
            e.target.classList.add('active');
            var otherList = getSibling(e.target);
            for (var i = 0; i < otherList.length; i++) {
                otherList[i].classList.remove('active');
            }
            content.style.display = 'block';
            var otherContent = getSibling(content);

            for (var i = 0; i < otherContent.length; i++) {
                otherContent[i].style.display = 'none';
            }
        }
    }
    //欢迎页功能绑定
    var wel = document.getElementsByClassName('wel-box');
    var menuList = document.getElementsByTagName('dd');
    // console.log(menuList[1])
    // menuList[1].click();
    for (let i = 0; i < wel.length; i++) {
        wel[i].onclick = function () {
            menuList[i + 1].click();
        }
    }
    //学生列表内搜索跳转
    var searchImg = document.getElementsByClassName('searchImg')[0];
    searchImg.onclick = function () {
        menuList[3].click();
    }
    //添加一个学生的信息
    var stuForm = document.getElementById('add-student-form');
    var addBtn = document.getElementById('add-student-btn');
    addBtn.onclick = function (e) {
        e.preventDefault();
        // e.defaultPrevented();
        var result = getFormData(stuForm)
        var stuFormData = result.data;
        if (result.status === "success") {
            sendMessage('GET', "/api/student/addStudent", stuFormData, function (response) {
                tips.style.display = "block";
                tipsText.innerHTML = "学生信息已记录！"
                resetBtn.click();
                tipsBtn.onclick = function () {
                    location.reload();
                }
            })
        } else {
            tips.style.display = "block";
            tipsText.innerHTML = result.msg;
        }
        //
    }
    //渲染学生列表页面
    //当 左侧边栏“学生列表”被点击时再进行网络请求
    menuList[1].onclick = function () {
        sendMessage("GET", "/api/student/findAll", "", function (response) {
            if (response.status === "success") {
                // var str = bulidList(response.data);
                // var tBody = document.querySelector('#student-list tbody')
                // tBody.innerHTML = str ;
                getTableData();
            } else {
                tips.style.display = "block";
                tipsText.innerHTML = result.msg;
            }
        })
    }
    //翻页 allPage = Math.ceil(response.data.length/pageSize);
    var prevBtn = document.getElementsByClassName('prev-btn')[0];
    var nextBtn = document.getElementsByClassName('next-btn')[0];
    var turnPage = document.getElementsByClassName('turn-page')[0];
    turnPage.onclick = function (e) {
        if (e.target == prevBtn) {
            if (nowPage == 1) {
                tips.style.display = "block";
                tipsText.innerHTML = '当前已经是第一页啦！';
            } else {
                nowPage--;
                getTableData();
            }
        } else if (e.target == nextBtn) {
            if (nowPage == allPage) {
                tips.style.display = "block";
                tipsText.innerHTML = '当前已经是最后一页啦！';
            } else {
                nowPage++;
                getTableData();
            }
        }
    }
    //学生列表内信息编辑和删除功能
    var tBody = document.getElementById('tBody');
    tBody.onclick = function (e) {
        controlEdit(e);
    }
    //添加 点击编辑蒙层 关闭弹窗功能
    modal.onclick = function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    }
    //搜索功能 
    // var searchInput = document.getElementById('searchMsg');//输入框
    var searchForm = document.getElementById('search-student-form');//表单
    var searchSubBtn = document.getElementById('searchSubBtn');
    //message=birth&searchMsg=sad+
    searchSubBtn.onclick = function (e) {
        e.preventDefault();

        var searchtBody = document.getElementById('search-tBody');
        var searchContent = document.getElementsByClassName('searchContent')[0];
        var searchName = searchForm.message.value;
        var searchValue = searchForm.searchMsg.value
        searchValue += "";
        if (searchName == "birth") {
            searchValue = 2020 - parseInt(searchValue)
            console.log(searchValue)
        }
        if (searchName == "null" || searchValue == "") {
            tips.style.display = "block";
            tipsText.innerHTML = "请确保您搜索的条件已经填写完整"
        } else {
            var allValue = [];
            var readyValue = [];
            sendMessage("GET", "/api/student/findAll", "", function (response) {
                if (response.status === "success") {
                    allValue = response.data;
                } else {
                    tips.style.display = "block";
                    tipsText.innerHTML = response.msg;
                }
                for (var i = 0; i < allValue.length; i++) {
                    if(searchName == "address"){
                        if(allValue[i][searchName].search(searchValue) != -1){
                            readyValue.push(allValue[i]);
                        }
                    }else{
                        if (allValue[i][searchName] === searchValue) {
                            readyValue.push(allValue[i]);
                        }
                    }
                }
                if(readyValue.length == 0){
                    tips.style.display = "block";
                    tipsText.innerHTML = "对不起，没有找到与您搜索的信息有匹配的同学，请仔细确认。如果仍有问题，请【联系作者】"
                }else{
                    var str = bulidList(readyValue);
                    searchtBody.innerHTML = str;
                    searchContent.style.display = 'block';
                    var tBody = document.getElementById ('search-tBody');
                    tBody.onclick = function (e) {
                        if (e.target.classList.contains('edit'))    {
                            // 获取当前编辑按钮对应的学生在表格当中 的索引值
                            var pageIndex = getStuIndex(e.target)   ;
                            // var index = (nowPage - 1) *  pageSize + pageIndex;
                            modal.style.display = 'block';
                            // 编辑表单数据回填
                            renderEditForm(readyValue[pageIndex])   ;
                        } else if (e.target.classList.contains  ('remove')) {
                            var pageIndex = getStuIndex(e.target)   ;
                            // var index = (nowPage - 1) *  pageSize + pageIndex;
                            var isDel = confirm('真的要删除学号为   ' + readyValue[pageIndex].sNo + '的学  生信息吗？');
                            if (isDel) {
                                sendMessage('GET', '/api/student/delBySno', {
                                    sNo: readyValue[pageIndex].sNo
                                }, function (res) {
                                    tips.style.display = "block";
                                    tipsText.innerHTML = `学号  为：${readyValue[pageIndex].  sNo} 的学生信息已删除`;
                                    getTableData();
                                })
                            }
                        }
                    }
                }
                
            })
        }
    }
}
bindEvent();
/**
 * @param getSibling 是一个获取某个dom节点所有兄弟节点的函数，会返回一个存放了所有兄弟节点的数组
 * 
 * @param {*} node 需要获取兄弟节点的dom元素
 */
function getSibling(node) {
    var parentNode = node.parentNode;
    var children = parentNode.children;
    var siblings = [];
    for (var i = 0; i < children.length; i++) {
        //找父节点的子节点，剔除自身
        if (children[i] != node) {
            siblings.push(children[i]);
        }
    }
    return siblings;
}

/**
 * 构建学生列表
 * @param {*}  data response.data请求后得到的返回数据中的data属性值
 * 
 * 该函数返回一个字符串，该字符串只需要放入目标的innerHTML中即可成功渲染
 */
function bulidList(data) {
    var str = "";
    data.forEach(function (item) {
        str += `<tr>
            <td>${item.sNo}</td>
            <td>${item.name}</td>
            <td>${item.sex == 0 ? '男' : '女'}</td>
            <td>${item.email}</td>
            <td>${new Date().getFullYear() - item.birth}</td>
            <td>${item.phone}</td>
            <td>${item.address}</td>
            <td>
                <button class="edit btn">编辑</button>
                <button class="remove btn">删除</button>
            </td>
        </tr>`
        return str
    })
    return str
}

/**
 * 找到当前点击的“编辑”是当前页面列表的第几个
 * @param {*} dom 用户点击的编辑按钮(e.target)
 * 
 * 注意：只判断该dom位于该页的第几个
 * 
 * 原理：找到自身所在的tr，循环判断这个tr在tr的父节点的子节点里排第几个
 */
function getStuIndex(dom) {
    var trNode = dom.parentNode;
    // 查找node标签的tr父节点
    while (trNode && trNode.tagName !== 'TR') {
        trNode = trNode.parentNode;
    }
    // if (!trNode) {
    //     alert('没有找到当前按钮对应的tr父节点')
    //     return false;
    // }
    var trNodeSiblings = trNode.parentNode.children;
    for (var i = 0; i < trNodeSiblings.length; i++) {
        if (trNodeSiblings[i] === trNode) {
            return i;
        }
    }
}

/**
 * 获取表单数据
 * @param {*} form 先选中一个表单后使用此函数，可以获取表单中的所有数据
 * return  {data: {}, msg: "", status: 'success'} 
 */
function getFormData(form) {
    //切记要与后端返回数据格式对应
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var sNo = form.sNo.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    var result = {
        data: {},
        msg: '',
        status: 'success'
    }
    // if (!name || !email || !sNo || !birth || !phone || !address) {
    //     result.status = 'fail';
    //     result.msg = '信息填写不完整，请校验后再交';
    //     return result;
    // }
    var emailReg = /^[\w.]+@[\w.]+\.(com|cn|net)$/
    if (!email.match(emailReg)) {
        result.status = 'fail';
        result.msg = '您输入的邮箱格式不正确';
        return result;
    }
    var sNoReg = /^\d{4,16}$/;
    if (!sNoReg.test(sNo)) {
        result.status = 'fail';
        result.msg = '学号必须为4-16位的数字';
        return result;
    }
    if (birth <= 1950 || birth >= 2020) {
        result.status = 'fail';
        result.msg = '出生年月必须在1950-2020年之间，您填入的信息不符合';
        return result;
    }
    var phoneReg = /^1[3456789]\d{9}$/;
    if (!phoneReg.test(phone)) {
        result.status = 'fail';
        result.msg = '您输入的手机号有误';
        return result;
    }
    result.data = {
        name,
        sex,
        sNo,
        phone,
        email,
        birth,
        address
    }
    return result;
}

//快速使用ajax,固定了发送请求的网站地址，只需要填入方式，路径，具体数据（函数内已经转化为字符串），以及请求成功后要执行的事情即可
/**
 * @param {String} type 请求方式：GET 或者 POST
 * @param {String} path 请求路径 请前往目标网站获取接口使用文档
 * @param {String} data 要发送的信息,函数内已经进行了转化
 * @param {Function} cb 请求成功后要执行的函数
 */
function sendMessage(type, path, data, cb) {

    var readyData = "";
    if (typeof data === "object") {
        for (var prop in data) {//转化为name = value的格式
            readyData += prop + "=" + data[prop] + "&";
        }
        readyData = readyData.slice(0, readyData.length - 1);
    } else {//如果不是对象（是字符串）
        readyData = data;
    }

    readyData += "&appkey=fengchen_1596021863440";
    // console.log("readyData : "+readyData);
    ajax(type, 'http://open.duyiedu.com' + path, readyData, function (response) {
        if (response.status === "success") {
            cb(response);
        } else {
            tipsText.innerHTML = response.msg;
            tips.style.display = 'block';
        }
    }, true);
}


var tableData = [];
/**
 * 请求表格数据，因为设置好了页码，所以每次请求只返回该页的数据
 * 
 * 每次修改页码之后都需要重新执行该函数！
 * @param {*} 无需传入参数
 */
function getTableData() {
    sendMessage('GET', '/api/student/findAll', "", function (response) {
        tableData = response.data;
        allPage = Math.ceil(tableData.length / pageSize);
        pageMsg.innerHTML = `每页${pageSize}个，第${nowPage}/${allPage}页`;
        var data = tableData.filter(function (item, index) {
            return index >= (nowPage - 1) * pageSize && index < nowPage * pageSize;
        });
        var str = bulidList(data);
        var tBody = document.querySelector('#student-list tbody')
        tBody.innerHTML = str;
    })
}

/**
 * 传入数据后，该函数会把数据回填到编辑弹框对应的输入框中
 * 
 * @param {*} data 传入表格数据
 */
function renderEditForm(data) {
    var form = document.getElementById('edit-student-form');
    for (var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}

/**
 * 该函数用来控制编辑与删除按钮的功能，所以请先选择好相应的按钮
 * @param {*} e 
 * 
 * 调用该函数时，请确保对应的按钮class中包含： edit或remove
 */
function controlEdit(e) {
    if (e.target.classList.contains('edit')) {
        // 获取当前编辑按钮对应的学生在表格当中的索引值
        var pageIndex = getStuIndex(e.target);
        var index = (nowPage - 1) * pageSize + pageIndex;
        modal.style.display = 'block';
        // 编辑表单数据回填
        renderEditForm(tableData[index]);
    } else if (e.target.classList.contains('remove')) {
        var pageIndex = getStuIndex(e.target);
        var index = (nowPage - 1) * pageSize + pageIndex;
        var isDel = confirm('真的要删除学号为' + tableData[index].sNo + '的学生信息吗？');
        if (isDel) {
            sendMessage('GET', '/api/student/delBySno', {
                sNo: tableData[index].sNo
            }, function (res) {
                tips.style.display = "block";
                tipsText.innerHTML = `学号为：${tableData[index].sNo} 的学生信息已删除`;
                getTableData();
            })
        }
    }
}