(function()
{
    var HTTP = function(method,url,username,password)
    {
        this.http   = new XMLHttpRequest();
        this.method = method.toUpperCase();
        this.http.open(method,url,true,username,password);
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


    HTTP.prototype =
    {
        /*
         * method
        */
        method:"GET",
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
                for(var name in opts.headers){
                    http.setRequestHeader(name,opts.headers[name]);
                }
                that.request_headers = opts.headers;
            }
            if(typeof opts.on_progress === "function"){
                that.on_progress = opts.on_progress;
            }
            if(typeof opts.on_finished === "function"){
                that.on_finished = opts.on_finished;
            }
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
            if(that.method.toUpperCase() === "POST" && data){
                if(!that.request_headers || !("Content-Type" in that.request_headers)){
                    http.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                }
            }
            var make_result = function()
            {
                return {
                    status: http.status,
                    status_text: http.statusText,

                    get type(){return http.responseType},
                    get data(){return http.response},
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
                        var result = null;

                        if(name === undefined){
                            result = http.getAllResponseHeaders() || null;
                        }else if(typeof(name) === "string"){
                            result = http.getResponseHeader(name) || null;
                        }
                        return result;
                    }
                };
            }
            return new Promise(function(resolve)
            {
                http.onreadystatechange = function(e)
                {
                    var readyState = http.readyState;

                    if(readyState === 3){
                        that.on_progress && that.on_progress.call(this);
                    }else if(readyState === 4){
                        console.log(http)
                        that.on_finished && that.on_finished.call(this,http.status,http.responseText);
                        resolve(make_result());
                    }
                };
                http.onerror = function(e){

                    resolve(make_result());
                };
                http.send(data);
            });
        },
        /*
         * abort
        */
        abort:function()
        {
            this.http.abort();
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
        console: console,
        JSON: JSON,
        HTTP: HTTP
    });


})();

