(function()
{

    ///---------------------------------------
    var HTTP = function(method,url,username,password)
    {
        this.url    = url;
        this.method = method.toUpperCase();

        if(typeof(TrashScript.perperties.HTTP_Intermedia) === "function"){
            this.username   = username;
            this.password   = password;
            this.intermedia = TrashScript.perperties.HTTP_Intermedia;
        }else{
            this.http = new XMLHttpRequest();
            this.http.open(method,url,true,username,password);
        }
    };

    var format_post_data = function(paramData)
    {
        var paramList = [];

        //---------make string
        var makeString = function(name,value)
        {
            if(typeof value === "object")
            {
                if(value instanceof Array){
                    for(var i=0;i<value.length;i++){
                        makeString(name + '[' + i + ']',value[i]);
                    }
                }else{
                    for(var key in value){
                        makeString(name + '[' + key + ']',value[key]);
                    }
                }
            }else if(value !== undefined){
                paramList.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
            }
        };

        //---------
        if(paramData instanceof Array){
            for(var i=0;i<paramData.length;i++){
                makeString(i,paramData[i]);
            }
        }else{
            for(var name in paramData){
                makeString(name,paramData[name]);
            }
        }
        return paramList.join("&");
    };


    ///---------------------------------------
    HTTP.prototype =
        {
            /*
             * url
            */
            url:"",
            /*
             * username
            */
            username:"",
            /*
             * password
            */
            password:"",
            /*
             * method
            */
            method:"GET",
            /*
             * intermedia
            */
            intermedia:null,
            /*
             * on progress
            */
            on_progress: null,
            /*
             * on finished
            */
            on_finished: null,
            /*
             * request headers
            */
            request_headers: null,

            /*
             * make XMLHttpRequest result
            */
            make_XMLHttpRequest_result:function()
            {
                var http = this.http;

                return {
                    status: http.status,
                    status_text: http.statusText,

                    get body(){return http.response},
                    get text(){return http.responseText},
                    get XML(){return http.responseXML},
                    get JSON()
                    {
                        try{
                            return JSON.parse(http.responseText);
                        }catch(e){}

                        return null;
                    },
                    header:function(name)
                    {
                        if(name === undefined){
                            return http.getAllResponseHeaders() || "";
                        }else if(typeof(name) === "string"){
                            return http.getResponseHeader(name) || null;
                        }
                        return null;
                    }
                };
            },
            /*
             * make IntermediaRequest result
            */
            make_IntermediaRequest_result:function(result)
            {
                return {
                    status: result.status,
                    status_text: result.status_text,

                    get body(){return result.body},
                    get text(){return result.body},
                    get XML(){
                        try{
                            var text   = result.body || "";
                            var parser = new DOMParser();

                            return parser.parseFromString(text,"application/xml");
                        }catch(e){}

                        return null;
                    },
                    get JSON()
                    {
                        try{
                            return JSON.parse(result.body);
                        }catch(e){}

                        return null;
                    },
                    header:function(name)
                    {
                        if(name === undefined){
                            var headers = [];

                            if(result.headers)
                            {
                                for(var key in result.headers){
                                    headers.push(key + ": " + result.headers[key]);
                                }
                            }
                            return headers.join("\n");
                        }else if(typeof(name) === "string"){
                            return result.headers[name.toLowerCase()] || null;
                        }
                        return null;
                    }
                };
            },

            /*
             * options
            */
            options:function(opts)
            {
                var that = this;
                var http = that.http;

                if(typeof opts !== "object"){
                    return;
                }
                if(opts.headers)
                {
                    that.request_headers = {};

                    for(var name in opts.headers)
                    {
                        var key   = name.toLowerCase();
                        var value = opts.headers[name];

                        that.request_headers[key] = value;

                        if(!that.intermedia){
                            http.setRequestHeader(key,value);
                        }
                    }
                }
                if(typeof opts.on_progress === "function"){
                    that.on_progress = opts.on_progress;
                }
                if(typeof opts.on_finished === "function"){
                    that.on_finished = opts.on_finished;
                }
            },
            /*
             * send XMLHttpRequest
            */
            send_XMLHttpRequest(data,resolve)
            {
                var that = this;
                var http = that.http;

                http.onreadystatechange = function(e)
                {
                    var readyState = http.readyState;

                    if(readyState === 3){
                        that.on_progress && that.on_progress.call(this);
                    }else if(readyState === 4){
                        that.on_finished && that.on_finished.call(this,http.status,http.responseText);
                        resolve(that.make_XMLHttpRequest_result());
                    }
                };
                http.onerror = function(e){
                    resolve(that.make_XMLHttpRequest_result());
                };
                http.send(data);
            },
            /*
             * send IntermediaRequest
            */
            send_IntermediaRequest(data,resolve)
            {
                var that = this;

                that.intermedia({
                    method:that.method,
                    url:that.url,
                    username:that.username,
                    password:that.password,
                    data:data,
                    headers:that.request_headers,
                },function(result){
                    resolve(that.make_IntermediaRequest_result(result));
                })
            },
            /*
             * send request
            */
            request:async function(data)
            {
                var that = this;
                var http = that.http;

                if(typeof data === "object"){
                    data = format_post_data(data);
                }
                if(typeof data !== "string"){
                    data = null;
                }
                if(that.method.toUpperCase() === "POST" && data)
                {
                    if(!that.request_headers){
                        that.request_headers = {};
                    }
                    if(!("content-type" in that.request_headers))
                    {
                        if(that.intermedia){
                            that.request_headers["content-type"] = "application/x-www-form-urlencoded;charset=UTF-8";
                        }else{
                            http.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                        }
                    }
                }
                return new Promise(function(resolve)
                {
                    if(!that.url){
                        resolve(that.make_XMLHttpRequest_result());
                    }else if(that.intermedia){
                        that.send_IntermediaRequest(data,resolve);
                    }else{
                        that.send_XMLHttpRequest(data,resolve);
                    }
                });

            },
            /*
             * abort
            */
            abort:function()
            {
                if(!this.intermedia){
                    this.http.abort();
                }
            }
        };

    HTTP.get = async function(url,opts)
    {
        var instance = new HTTP("GET",url);
        instance.options(opts);

        return await instance.request();
    };
    HTTP.post = async function(url,data,opts)
    {
        var instance = new HTTP("POST",url);
        instance.options(opts);

        return await instance.request(data);
    };


    ///---------------------------------------
    class DOMs
    {
        #elements;

        constructor(data,ctx)
        {
            this.length    = 0;
            this.#elements = [];

            if(typeof(data) === "string")
            {
                try{
                    let elements = null;

                    if(typeof(ctx) === "string"){
                        elements = document.querySelectorAll(ctx + " " + data);
                    }else if(typeof(ctx) === "object"){
                        if((ctx instanceof DOMs) && ctx.length > 0){
                            elements = ctx.#elements[0].querySelectorAll(data);
                        }
                    }else{
                        elements = document.querySelectorAll(data);
                    }
                    if(elements && elements.length)
                    {
                        for(let i=0;i<elements.length;i++){
                            this.#elements.push(elements[i]);
                            this.length++;
                        }
                    }
                }catch(e){}
            }else if(data instanceof DOMs){
                for(let i=0;i<data.length;i++){
                    this.#elements.push(data.#elements[i]);
                    this.length++;
                }
            }else if(typeof(data) === "object" && ((data instanceof Array) || data.length))
            {
                for(let i=0;i<data.length;i++)
                {
                    let elem = data[i];

                    if(elem instanceof DOMs){
                        if(elem.length > 0){
                            this.#elements.push(elem.#elements[0]);
                            this.length++;
                        }
                    }else if(elem instanceof Element){
                        this.#elements.push(elem);
                        this.length++;
                    }
                }

            }else if(data instanceof Element){
                this.#elements.push(data);
                this.length++;
            }
        }

        eq(i)
        {
            if(typeof(i) === "number" && i < this.length){
                return $(this.#elements[i]);
            }
            return null;
        }
        each(callback)
        {
            for(let i=0;i<this.length;i++)
            {
                let result = callback(i,this.eq(i));

                if(result !== undefined){
                    return result;
                }
            }
        }

        css(name)
        {
            if(this.length > 0 && typeof(name) === "string"){
                return getComputedStyle(this.#elements[0])[name] || "";
            }
            return "";
        }
        attr(name)
        {
            if(this.length > 0 && typeof(name) === "string"){
                return this.#elements[0].getAttribute(name);
            }
            return "";
        }
        text()
        {
            if(this.length > 0){
                return this.#elements[0].innerText;
            }
            return "";
        }
        html()
        {
            if(this.length > 0){
                return this.#elements[0].innerHTML;
            }
            return "";
        }
        parent()
        {
            if(this.length > 0)
            {
                let parent = this.#elements[0].parentElement;

                if(parent){
                    return $(parent);
                }
            }
            return null;
        }
        children()
        {
            if(this.length > 0){
                return $(this.#elements[0].children);
            }
            return $();
        }
        siblings()
        {
            if(this.length > 0)
            {
                let parent = this.#elements[0].parentElement;

                if(parent){
                    return $(parent.children);
                }
            }
            return $();
        }
        next()
        {
            if(this.length > 0)
            {
                let element = this.#elements[0].nextElementSibling;

                if(element){
                    return $(element);
                }
            }
            return null;
        }
        prev()
        {
            if(this.length > 0)
            {
                let element = this.#elements[0].previousElementSibling;

                if(element){
                    return $(element);
                }
            }
            return null;
        }
        val()
        {
            let value = null;

            if(this.length > 0)
            {
                let element = this.#elements[0];

                if(element)
                {
                    if((value = element.value) === undefined){
                        value = element.getAttribute("value");
                    }
                }
            }
            return value;
        }
    }


    ///---------------------------------------
    var $ = function(data,ctx)
    {
        return new DOMs(data,ctx);
    }


    ///--------------------------------
    TrashScript.bind({
        timestamp:function(){
            return new Date().getTime();
        },
        sleep:async function(val)
        {
            return new Promise(function(resolve){
                setTimeout(resolve,val);
            });
        },
        alert:function(str){
            alert && alert(str)
        },
        URL: URL,
        atob: atob,
        btoa: btoa,
        encodeURI: encodeURI,
        encodeURIComponent: encodeURIComponent,
        console: console,
        JSON: JSON,
        HTTP: HTTP,
        $: $
    });


})();

