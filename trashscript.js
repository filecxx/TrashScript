
var TrashScript = function(source,callback)
{
    var i            = 0;
    var error_status = {
        type:"",
        text: "",
        line_text:"",
        line: 0,
        i:0,
        line_begin: 0,
        begin: 0,
        end: 0,
        source_length:source.length,

        set:function(type,begin,end)
        {
            if(begin === undefined || end === undefined){
                debugger;
            }
            this.begin = begin;
            this.end   = end;

            if(typeof(TrashScript.lang) === "function"){
                this.type = TrashScript.lang(type);
            }else{
                this.type = type;
            }
            if(end >= begin){
                this.locate(begin,end);
            }
            return {type:token_types.error,begin:begin,end:end};
        },
        locate:function(begin,end)
        {
            var line       = 0;
            var line_begin = 0;
            var line_pos   = 0;
            var text       = "";

            for(var i=0;i<=end;i++)
            {
                var c = source[i];

                if(c === '\n'){
                    line++;
                    line_begin = 0;
                    line_pos   = i + 1;
                }
                if(i >= begin){
                    text += c;
                }
                line_begin++;
            }
            this.i          = i;
            this.line       = line;
            this.line_begin = line_begin;
            this.text       = text;
            this.line_text  = source.substring(line_pos,source.indexOf('\n',line_pos));
        }
    };


    ///--------------------------
    var token_types    =
    {
        error:0,

        undefined:1,
        number:2,
        bool:3,
        null_:4,
        identifier:5,
        string:6,
        array:7,
        args:8,
        object:9,

        operator:10,
        keyword:11,
        binary_expr:12,
        unary_expr:13,
        ternary_expr:14,
        call:15,
        data_element:16,

        if_condition:17,
        for_loop:18,
        while_loop:19,
        break_loop:20,
        continue_loop:21,
        return_value:22,
        functor:23,
        type_of:24,
        this_obj:25,

        comment:97,
        skip:98,
        end:99
    }
    var keywords_types =
    {
        "true":{
            token_type:token_types.bool,
            value:true
        },
        "false":{
            token_type:token_types.bool,
            value:false
        },
        "null":{
            token_type:token_types.null_,
            value:null
        },
        "undefined":{
            token_type:token_types.undefined,
            value:undefined
        },
        "if":{
            token_type:token_types.keyword,
            value:"if"
        },
        "else":{
            token_type:token_types.keyword,
            value:"else"
        },
        "for":{
            token_type:token_types.keyword,
            value:"for"
        },
        "while":{
            token_type:token_types.keyword,
            value:"while"
        },
        "return":{
            token_type:token_types.keyword,
            value:"return"
        },
        "continue":{
            token_type:token_types.keyword,
            value:"continue"
        },
        "break":{
            token_type:token_types.keyword,
            value:"break"
        },
        "function":{
            token_type:token_types.keyword,
            value:"functor"
        },
        "typeof":{
            token_type:token_types.keyword,
            value:"typeof"
        },
        "this":{
            token_type:token_types.keyword,
            value:"this"
        }
    }
    var operator_attrs =
    {
        unary:           1 << 0,
        binary:          1 << 1,
        ternary:         1 << 2,
        assignment:      1 << 3,
        compound_assign: 1 << 4,
        calculator:      1 << 5,
        accessor:        1 << 6,
        prop_accessor:   1 << 7,
        comparator:      1 << 8,
        unary_left:      1 << 9,
        unary_right:     1 << 10,
        creament:        1 << 11,
    }
    var operator_types = {
        "++":{
            priority:16,
            attr: operator_attrs.unary | operator_attrs.unary_left | operator_attrs.unary_right | operator_attrs.creament,
        },
        "--":{
            priority:16,
            attr: operator_attrs.unary | operator_attrs.unary_left | operator_attrs.unary_right | operator_attrs.creament,
        },
        ".":{
            priority:19,
            attr: operator_attrs.prop_accessor | operator_attrs.accessor | operator_attrs.binary,
            binary_exec:function(left_object,right_text){
                return left_object[right_text];
            }
        },
        "=":{
            priority:3,
            attr: operator_attrs.assignment | operator_attrs.binary
        },
        "==":{
            priority:10,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left == right;
            }
        },
        "===":{
            priority:10,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right) {
                return left === right;
            }
        },
        "~":{
            priority:16,
            attr:operator_attrs.unary | operator_attrs.unary_left,
            unary_exec:function(data){
                return ~data;
            }
        },
        "!":{
            priority:16,
            attr:operator_attrs.unary | operator_attrs.unary_left,
            unary_exec:function(data){
                return !data;
            }
        },
        "!=":{
            priority:10,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left != right;
            }
        },
        "!==":{
            priority:10,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left !== right;
            }
        },
        "+":{
            priority:13,
            attr: operator_attrs.calculator | operator_attrs.binary | operator_attrs.unary | operator_attrs.unary_left,
            unary_exec:function(data){
                return +data;
            },
            binary_exec:function(left,right){
                return left + right;
            }
        },
        "+=":{
            priority:3,
            attr: operator_attrs.compound_assign | operator_attrs.binary,
            binary_exec:function(left,right){
                return left + right;
            }
        },
        "-":{
            priority:13,
            attr: operator_attrs.calculator | operator_attrs.binary | operator_attrs.unary | operator_attrs.unary_left,
            unary_exec:function(data){
                return -data;
            },
            binary_exec:function(left,right){
                return left - right;
            }
        },
        "-=":{
            priority:3,
            attr: operator_attrs.compound_assign | operator_attrs.binary,
            binary_exec:function(left,right){
                return left - right;
            }
        },
        "*":{
            priority:14,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left * right;
            }
        },
        "**":{
            priority:14,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left ** right;
            }
        },
        "*=":{
            priority:3,
            attr: operator_attrs.compound_assign | operator_attrs.binary,
            binary_exec:function(left,right){
                return left * right;
            }
        },
        "/":{
            priority:14,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left / right;
            }
        },
        "/=":{
            priority:3,
            attr: operator_attrs.compound_assign | operator_attrs.binary,
            binary_exec:function(left,right){
                return left / right;
            }
        },
        "%":{
            priority:14,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left % right;
            }
        },
        ">":{
            priority:11,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left > right;
            }
        },
        ">>":{
            priority:12,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left >> right;
            }
        },
        ">>>":{
            priority:12,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left >>> right;
            }
        },
        ">=":{
            priority:11,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left >= right;
            }
        },
        "<":{
            priority:11,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left < right;
            }
        },
        "<<":{
            priority:12,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left << right;
            }
        },
        "<=":{
            priority:11,
            attr: operator_attrs.comparator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left <= right;
            }
        },
        "&":{
            priority:9,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left & right;
            }
        },
        "&&":{
            priority:6,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left && right;
            }
        },
        "|":{
            priority:9,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left | right;
            }
        },
        "||":{
            priority:6,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left || right;
            }
        },
        "|=":{
            priority:3,
            attr: operator_attrs.compound_assign | operator_attrs.binary,
            binary_exec:function(left,right){
                return left | right;
            }
        },
        "^":{
            priority:8,
            attr: operator_attrs.calculator | operator_attrs.binary,
            binary_exec:function(left,right){
                return left ^ right;
            }
        },
        "?":{
            priority:4,
            attr: operator_attrs.ternary
        }
    };
    var error_types    = {
        OK:{
            value:0
        },
        syntax_error:{
            value:1,
            call:function(begin,end){
                return error_status.set("syntax_error",begin,end);
            }
        },
        unknown_operator:{
            value:2,
            call:function(begin,end){
                return error_status.set("unknown_operator",begin,end);
            }
        },
        no_such_variable:{
            value:3,
            call:function(begin,end){
                return error_status.set("no_such_variable",begin,end);
            }
        },
        no_such_property:{
            value:4,
            call:function(begin,end){
                return error_status.set("no_such_property",begin,end);
            }
        },
        not_a_function:{
            value:5,
            call:function(begin,end){
                return error_status.set("not_a_function",begin,end);
            }
        },
        invalid_index_type:{
            value:6,
            call:function(begin,end){
                return error_status.set("invalid_index_type",begin,end);
            }
        },
        invalid_data_type:{
            value:7,
            call:function(begin,end){
                return error_status.set("invalid_data_type",begin,end);
            }
        },
        invalid_arguments:{
            value:8,
            call:function(begin,end){
                return error_status.set("invalid_arguments",begin,end);
            }
        },
        max_exec_limit_exceeded:{
            value:9,
            call:function(begin,end){
                return error_status.set("max_exec_limit_exceeded",begin,end);
            }
        }
    }
    var tokens_queue   = [];


    ///--------------------------
    function parse_error(begin,end,error)
    {
        error.call(begin,end);
        throw error_status;
    }
    function runtime_error(token,error)
    {
        error.call(token.begin,token.end);
        throw error_status;
    }


    ///--------------------------
    function isspace(c)
    {
        return c === ' ' || c === '\t' || c === '\r' || c === '\n';
    }
    function isalpha(c)
    {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    }
    function isdigit(c)
    {
        return c >= '0' && c <= '9';
    }
    function isalnum(c)
    {
        return isalpha(c) || isdigit(c);
    }
    function isoperator(text)
    {
        return text in operator_types;
    }


    ///--------------------------
    function is_prop_accessor_operator(token)
    {
        if(token.type === token_types.operator){
            var operator = operator_types[token.value];
            return (operator.attr & operator_attrs.prop_accessor);
        }
        return false;
    }
    function is_left_unary_operator(token)
    {
        if(token.type !== token_types.operator){
            return false;
        }
        var operator = operator_types[token.value];
        return (operator.attr & operator_attrs.unary) && (operator.attr & operator_attrs.unary_left);
    }
    function is_section_end(token){
        return token.type === token_types.skip || token.type === token_types.end;
    }
    function is_data_token(token)
    {
        switch(token.type)
        {
        case token_types.undefined:
        case token_types.number:
        case token_types.bool:
        case token_types.null_:
        case token_types.identifier:
        case token_types.string:
        case token_types.args:
        case token_types.array:
        case token_types.object:
        case token_types.binary_expr:
        case token_types.unary_expr:
        case token_types.ternary_expr:
        case token_types.call:
        case token_types.data_element:
        case token_types.functor:
        case token_types.type_of:
        case token_types.this_obj:
            return true;
        }
        return false;
    }
    function is_data_property_accessible(data)
    {
        if(data === null){
            return false;
        }
        return typeof(data) === "number" || typeof(data) === "string" || typeof(data) === "object" || typeof(data) === "function";
    }


    ///--------------------------
    function skip_space()
    {
        for(;i<source.length;++i)
        {
            if(!isspace(source[i])){
                break;
            }
        }
    }


    ///--------------------------
    function parse_number()
    {
        var begin = i;
        var dots  = 0;
        var text  = "";
        var hex   = false;
        var value = 0;

        for(;i<source.length;i++)
        {
            var c = source[i];

            if((c === 'x' || c === 'X') && text === "0"){
                hex   = true;
                text += c;
                continue;
            }
            if(c === '.')
            {
                if(hex){
                    parse_error(begin,i,error_types.syntax_error);
                }
                if(dots === 0){
                    ++dots;
                    text += c;
                }
            }
            if(!isdigit(c) && !(hex && (isalpha(c) && ((c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f'))))){
                break;
            }
            text += c;
        }
        if(dots === 0 || hex){
            value = parseInt(text);
        }else{
            value = parseFloat(text);
        }
        return {type:token_types.number,value:value,begin:begin,end:i};
    }
    function parse_identifier()
    {
        var begin = i;
        var text  = "";

        for(;i<source.length;i++)
        {
            var c = source[i];

            if(!isalnum(c) && c !== '_'){
                break;
            }
            text += c;
        }
        if(text in keywords_types)
        {
            var keyword = keywords_types[text];
            return {type:keyword.token_type,value:keyword.value,begin:begin,end:i};
        }
        return {type:token_types.identifier,value:text,begin:begin,end:i};
    }
    function parse_string(terminator)
    {
        var begin = i;
        var value = "";

        for(++i;i<source.length;i++)
        {
            var c = source[i];

            if(c === '\\')
            {
                if(i >= source.length - 1){
                    parse_error(begin,i,error_types.syntax_error);
                }
                var next = source[++i];

                if(next !== '\\' && next !== terminator){
                    value += '\\';
                }
                value += next;
                continue;
            }else if(c === terminator){
                ++i;
                break;
            }
            value += c;
        }
        return {type:token_types.string,value:value,begin:begin,end:i};
    }
    function parse_pair()
    {
        var key = parse_token();

        if((key.type !== token_types.identifier && key.type !== token_types.string)){
            parse_error(key.begin,key.end,error_types.syntax_error);
        }
        skip_space();

        if(i >= source.length - 1 || source[i] !== ':'){
            parse_error(key.begin,key.end,error_types.syntax_error);
        }

        ++i;
        var value = parse_section();

        if(!is_data_token(value)){
            parse_error(value.begin,value.end,error_types.syntax_error);
        }
        return {key:key,value:value};
    }
    function parse_scope_body()
    {
        skip_space();

        var section = null;
        var sections = [];

        if(source[i] !== '{')
        {
            if(!is_section_end(section = parse_section())){
                sections.push(section);
            }else if(source[i] === ';'){
                ++i;
            }
            return sections;
        }
        for(++i;i<source.length;)
        {
            skip_space();
            var c = source[i];

            if(tokens_queue.length === 0 && c === '}'){
                i++;
                break;
            }
            if(!is_section_end(section = parse_section())){
                sections.push(section);
            }else if(source[i] === ';' || source[i] === ','){
                ++i;
            }
        }
        return sections;
    }
    function parse_if_condition()
    {
        var begin = i;
        skip_space();

        if(i > source.length - 1 || source[i++] !== '('){
            parse_error(i,i,error_types.syntax_error);
        }
        skip_space();
        var condition = parse_section();

        if(!is_data_token(condition)){
            parse_error(condition.begin,condition.end,error_types.syntax_error);
        }
        if(source[i++] !== ')'){
            parse_error(i,i,error_types.syntax_error);
        }
        var body = parse_scope_body();
        var next = parse_token();

        if(next.type === token_types.keyword && next.value === "else"){
            next = parse_scope_body();
        }else{
            tokens_queue.push(next);
            next = null;
        }
        return {type:token_types.if_condition,value:{condition:condition,body:body,else_body: next},begin:begin,end:i};
    }
    function parse_for_loop()
    {
        var begin      = i;
        var conditions = [[],[],[]];
        var at         = 0;

        skip_space();

        if(i > source.length - 1 || source[i++] !== '('){
            parse_error(i,i,error_types.syntax_error);
        }
        for(;i<source.length;)
        {
            var c = source[i];

            if(c === ')'){
                ++i;
                break;
            }else if(c === ';'){
                ++i;
                ++at;
                continue;
            }else if(c === ','){
                ++i;
                continue;
            }
            var section = parse_section();

            if(!is_data_token(section)){
                break;
            }
            conditions[at].push(section);
        }
        if(at !== 2){
            parse_error(begin,i,error_types.syntax_error);
        }
        return {type:token_types.for_loop,value:{conditions:conditions,body:parse_scope_body()},begin:begin,end:i};
    }
    function parse_while_loop()
    {
        var begin = i;
        skip_space();

        if(i > source.length - 1 || source[i++] !== '('){
            parse_error(i,i,error_types.syntax_error);
        }
        skip_space();
        var conditions = [];

        for(;i<source.length;)
        {
            var c = source[i];

            if(c === ')'){
                break;
            }else if(c === ','){
                ++i;
                continue;
            }
            var section = parse_section();

            if(!is_data_token(section)){
                break;
            }
            conditions.push(section);
        }
        if(source[i++] !== ')'){
            parse_error(i,i,error_types.syntax_error);
        }
        return {type:token_types.while_loop,value:{conditions:conditions,body:parse_scope_body()},begin:begin,end:i};
    }
    function parse_return()
    {
        var begin = i;
        var value = parse_section();

        if(is_section_end(value)){
            value = {type:token_types.undefined,begin:begin,end:i};

            if(source[i] === ';'){
                ++i;
            }
        }else if(!is_data_token(value)){
            parse_error(begin,i,error_types.syntax_error);
        }
        return {type:token_types.return_value,value:value,begin:begin,end:i};
    }
    function parse_list(token_type,terminator)
    {
        var begin = i;
        var items = [];

        for(++i;i<source.length;)
        {
            skip_space();

            if(source[i] === terminator){
                i++;
                break;
            }
            var token = parse_section();

            if(!is_data_token(token) || i > source.length - 1){
                parse_error(token.begin,token.end,error_types.syntax_error);
            }
            items.push(token);

            if(source[i] === ','){
                i++
                continue;
            }
            if(source[i] !== terminator){
                parse_error(token.begin,token.end,error_types.syntax_error);
            }
        }
        return {type:token_type,value:items,begin:begin,end:i};
    }
    function parse_object()
    {
        var begin = i;
        var items = {};

        for(++i;i<source.length;)
        {
            skip_space();

            if(source[i] === '}'){
                i++;
                break;
            }
            var pair = parse_pair();

            if("type" in pair){
                return pair;
            }
            items[pair.key.value] = pair.value;
            skip_space();

            if(source[i] === ','){
                i++
                continue;
            }
            if(source[i] !== '}'){
                parse_error(i,i,error_types.syntax_error);
            }
        }
        return {type:token_types.object,value:items,begin:begin,end:i};
    }
    function parse_operator()
    {
        var begin = i;
        var text  = source[i];

        for(++i;i<source.length;i++)
        {
            if(!isoperator(text + source[i])){
                break;
            }
            text += source[i];
        }
        if(!(text in operator_types)){
            parse_error(begin,i,error_types.unknown_operator);
        }
        return {type:token_types.operator,value:text,begin:begin,end:i};
    }
    function parse_comment()
    {
        var begin = i;

        if(++i >= source.length - 1){
            parse_error(begin,i,error_types.syntax_error);
        }
        var line_only = source[i] === '/'; //0: range, 1: line

        for(;i<source.length;i++)
        {
            var c = source[i];

            if(line_only)
            {
                if(c === '\n'){
                    break;
                }
            }else if(c === '*' && i < source.length - 1 && source[i + 1] === '/'){
                i += 2;
                break;
            }
        }
        return {type:token_types.comment};
    }
    function parse_parameters()
    {
        var items = [];

        for(++i;i<source.length;)
        {
            var c = source[i];

            if(c === ','){
                ++i;
                continue;
            }else if(c === ')'){
                ++i;
                break;
            }
            var token = parse_token();

            if(token.type !== token_types.identifier){
                parse_error(token.begin,token.end,error_types.syntax_error);
            }
            items.push(token.value);
        }
        return items;
    }
    function parse_functor()
    {
        skip_space();
        var name = null;

        if(isalnum(source[i]) || source[i] === '_')
        {
            var token = parse_token();

            if(token.type !== token_types.identifier){
                parse_error(token.begin,token.end,error_types.syntax_error);
            }else{
                name = token.value;
            }
        }
        skip_space();

        if(source[i] !== '('){
            parse_error(i,i,error_types.syntax_error);
        }
        var params = parse_parameters();
        skip_space();

        if(source[i] !== '{'){
            parse_error(i,i,error_types.syntax_error);
        }
        return {type:token_types.functor,name:name,params:params,sections:parse_scope_body()};
    }
    function parse_typeof()
    {
        skip_space();

        if(source[i] === '('){
            return parse_list(token_types.type_of,')');
        }
        var section = parse_section();

        if(!is_data_token(section)){
            parse_error(section.begin,section.end,error_types.syntax_error);
        }
        return {type:token_types.type_of,value:section,begin:section.begin,end:i};
    }
    function parse_token()
    {
        if(tokens_queue.length > 0){
            return tokens_queue.shift();
        }
        skip_space();

        var begin = i;
        var c     = source[i];

        if(isdigit(c)){
            return parse_number();
        }else if(isalpha(c) || c === '_'){
            return parse_identifier();
        }else if(c === '"' || c === "'"){
            return parse_string(c);
        }else if(c === '['){
            return parse_list(token_types.array,']');
        }else if(c === '{'){
            return parse_object();
        }else if(c === '('){
            return parse_list(token_types.args,')');
        }else if(c === '/' && i < source.length - 1 && (source[i + 1] === '/' || source[i + 1] === '*')){
            parse_comment();
            return parse_token();
        }else if(isoperator(c)){
            return parse_operator(c);
        }else if(c === ';'){
            return {type:token_types.end,begin:begin,end:i};
        }else if(i >= source.length - 1){
            return {type:token_types.end,begin:begin,end:i};
        }
        return {type:token_types.end,begin:begin,end:i};
    }


    ///--------------------------
    function parse_unary_left_expr(operator_token)
    {
        var next = parse_section(operator_types[operator_token.value].priority);

        if(!is_data_token(next)){
            parse_error(operator_token.begin,operator_token.end,error_types.syntax_error);
        }
        return {
            type: token_types.unary_expr,
            value: {operator:operator_token,data:next,left_side:true},
            begin: operator_token.begin,
            end: next.end
        };
    }
    function parse_ternary_expr(left,current_priority)
    {
        var middle = parse_section(current_priority);

        if(!is_data_token(middle)){
            parse_error(middle.begin,middle.end,error_types.syntax_error);
        }
        skip_space();

        if(source[i++] !== ':'){
            parse_error(i,i,error_types.syntax_error);
        }
        var right = parse_section(0);

        if(!is_data_token(right)){
            parse_error(right.begin,right.end,error_types.syntax_error);
        }
        return {type:token_types.ternary_expr,value:{left:left,middle:middle,right:right},begin:left.begin,end:right.end};
    }
    function parse_expr(left,current_priority)
    {
        var next = parse_token();

        if(is_section_end(next)){
            return next;
        }
        if(next.type === token_types.operator)
        {
            var operator = operator_types[next.value];

            if(operator.priority > current_priority)
            {
                if((operator.attr & operator_attrs.unary) && (operator.attr & operator_attrs.unary_right))
                {
                    if(left.type === token_types.identifier || left.type === token_types.data_element || left.type === token_types.binary_expr){
                        return {type:token_types.unary_expr,value:{operator:next,data:left,left_side:false},begin:left.begin,end:next.end};
                    }
                }
                if(operator.attr & operator_attrs.binary)
                {
                    var right = parse_section(operator.priority);

                    if(!is_data_token(right)){
                        parse_error(right.begin,right.end,error_types.syntax_error);
                    }
                    return {type:token_types.binary_expr,value:{left:left,operator:next,right:right},begin:left.begin,end:right.end};
                }else if(operator.attr & operator_attrs.ternary){
                    return parse_ternary_expr(left,operator.priority);
                }
            }
        }else if(next.type === token_types.array){
            if(19 > current_priority){
                return {type:token_types.data_element,value:{data:left,elements:next},begin:left.begin,end:next.end};
            }
        }else if(next.type === token_types.args){
            if(19 > current_priority){
                return {type:token_types.call,value:{data:left,args:next},begin:left.begin,end:next.end};
            }
        }
        tokens_queue.push(next);

        return left;
    }
    function parse_section(current_priority)
    {
        var token = parse_token();

        if(current_priority === undefined){
            current_priority = 0;
        }
        if(is_section_end(token)){
            return token;
        }
        if(token.type === token_types.keyword)
        {
            switch(token.value)
            {
            case "if":
                return parse_if_condition();
            case "for":
                return parse_for_loop();
            case "while":
                return parse_while_loop();
            case "return":
                return parse_return();
            case "break":
                return {type:token_types.break_loop,begin:token.begin,end:i};
            case "continue":
                return {type:token_types.continue_loop,begin:token.begin,end:i};
            case "functor":
                token = parse_functor();
                break;
            case "typeof":
                token = parse_typeof();
                break;
            case "this":
                token = {type:token_types.this_obj,begin:token.begin,end:i};
                break;
            default:
                parse_error(token.begin,token.end,error_types.syntax_error);
            }
        }
        if(is_left_unary_operator(token)){
            return parse_unary_left_expr(token,current_priority);
        }
        while(is_data_token(token))
        {
            var result = parse_expr(token,current_priority);

            if(result === token){
                return result;
            }
            if(is_section_end(result)){
                return token;
            }
            token = result;
        }
        return token;
    }
    function parse()
    {
        var sections = [];

        while(i < source.length)
        {
            var section = parse_section();

            if(!is_section_end(section)){
                sections.push(section);
            }else if(source[i] === ':'){
                parse_error(section.begin,section.end,error_types.syntax_error);
            }else{
                ++i;
            }
        }
        return sections;
    }


    ///--------------------------
    var function_executor = function(sections,parent_executor,context,global_context)
    {
        this.status          = "none";
        this.returned        = false;
        this.looping         = false;
        this.result          = undefined;
        this.variable_map    = {};
        this.sections        = sections;
        this.callback        = null;
        this.exec_count      = 0;
        this.parent_executor = parent_executor;
        this.context         = context;
        this.global_context  = global_context;
    }
    function_executor.prototype =
    {
        ///--------------------------
        exec_element_lookup:function(ctx_token,elements_token,callback)
        {
            var elements = this.exec_token(elements_token);

            if(elements instanceof Array && elements.length > 0)
            {
                var ctx   = this.exec_token(ctx_token);
                var index = elements[elements.length - 1];

                if(typeof(index) !== "string" && typeof(index) !== "number"){
                    runtime_error(elements_token,error_types.invalid_index_type);
                }
                if(!is_data_property_accessible(ctx)){
                    runtime_error(elements_token,error_types.invalid_data_type);
                }
                return callback(ctx,index);
            }
            runtime_error(elements_token,error_types.invalid_index_type);
        },
        exec_prop_lookup:function(ctx_token,prop_token,callback)
        {
            if(prop_token.type !== token_types.identifier){
                runtime_error(prop_token,error_types.invalid_data_type);
            }
            var ctx = this.exec_token(ctx_token);

            if(is_data_property_accessible(ctx)){
                return callback(ctx,prop_token.value);
            }
            runtime_error(ctx_token,error_types.invalid_data_type);
        },


        ///--------------------------
        exec_data_element_assignment:function(token,operator,value)
        {
            this.exec_element_lookup(token.value.data,token.value.elements,function(ctx,index)
            {
                if(operator.attr & operator_attrs.compound_assign){
                    ctx[index] = operator.binary_exec(ctx[index],value);
                }else{
                    ctx[index] = value;
                }
            })
            return value;
        },
        exec_data_prop_assignment:function(left_token,prop_token,operator,value)
        {
            return this.exec_prop_lookup(left_token,prop_token,function(ctx,name)
            {
                if(operator.attr & operator_attrs.compound_assign){
                    return ctx[name] = operator.binary_exec(ctx[name],value);
                }
                return ctx[name] = value;
            });
        },
        exec_assignment:function(token,operator)
        {
            var value = this.exec_token(token.value.right);

            if(token.value.left.type === token_types.identifier)
            {
                var var_name     = token.value.left.value;
                var variable_map = this.variable_map;

                if(operator.attr & operator_attrs.compound_assign){
                    return variable_map[var_name] = operator.binary_exec(variable_map[var_name],value);
                }
                return variable_map[var_name] = value;
            }else if(token.value.left.type === token_types.data_element){
                return this.exec_data_element_assignment(token.value.left,operator,value);
            }else if(is_prop_accessor_operator(token.value.left)){
                return this.exec_data_prop_assignment(token.value.left,token.value.right,operator,value);
            }
            runtime_error(token,error_types.invalid_data_type);
        },


        ///-----------------------
        exec_identifier:function(token)
        {
            var current_executor = this;

            do{
                if(token.value in current_executor.variable_map){
                    return current_executor.variable_map[token.value]
                }
                current_executor = current_executor.parent_executor;
            }while(current_executor);

            if(token.value in TrashScript.perperties){
                return TrashScript.perperties[token.value];
            }
            if(this.global_context){
                return this.global_context[token.value];
            }
            return undefined;
        },
        exec_array:function(token)
        {
            var items  = token.value;
            var result = [];

            result.length = items.length;

            for(var i=0;i<items.length;i++){
                result[i] = this.exec_token(items[i]);
            }
            return result;
        },
        exec_args:function(token)
        {
            var items  = token.value;

            for(var i=0;i<items.length;i++)
            {
                var result = this.exec_token(items[i]);

                if(i === items.length - 1){
                    return result;
                }
            }
            return runtime_error(token,error_types.syntax_error);
        },
        exec_object:function(token)
        {
            var items  = token.value;
            var result = {};

            for(var name in items){
                result[name] = this.exec_token(items[name]);
            }
            return result;
        },
        exec_unary_expr:function(token)
        {
            var operator_name = token.value.operator.value;
            var operator      = operator_types[operator_name];
            var exec_unary    = function(var_value)
            {
                var origin = var_value;
                var newval = var_value;

                if(operator.attr & operator_attrs.creament)
                {
                    if(operator_name === "++"){
                        newval = token.value.left_side ? ++origin : origin++;
                    }else if(operator_name === "--"){
                        newval = token.value.left_side ? --origin : origin--;
                    }
                }else{
                    newval = operator.unary_exec(origin);
                }
                return {origin:origin,newval:newval};
            }
            if(token.value.data.type === token_types.identifier)
            {
                var name = token.value.data.value;

                if(!(name in this.variable_map)){
                    runtime_error(token,error_types.no_such_variable);
                }
                var result = exec_unary(this.variable_map[name]);
                this.variable_map[name] = result.origin;

                return result.newval;
            }else if(token.value.data.type === token_types.data_element)
            {
                return this.exec_element_lookup(token.value.data.value.data,token.value.data.value.elements,function(ctx,index){
                    var result = operator.unary_exec(ctx[index]);
                    ctx[index] = result.origin;
                    return result.newval;
                })
            }else if(is_prop_accessor_operator(token.value.data))
            {
                return this.exec_prop_lookup(token.value.data.value.left,token.value.data.value.right,function(ctx,name){
                    var result = operator.unary_exec(ctx[name]);
                    ctx[name] = result.origin;
                    return result.newval;
                });
            }else{
                return exec_unary(this.exec_token(token.value.data)).newval;
            }
        },
        exec_binary_expr:function(token)
        {
            var operator = operator_types[token.value.operator.value];

            if((operator.attr & operator_attrs.assignment) || (operator.attr & operator_attrs.compound_assign)){
                return this.exec_assignment(token,operator);
            }else if((operator.attr & operator_attrs.accessor))
            {
                if(operator.attr & operator_attrs.prop_accessor){
                    return this.exec_prop_lookup(token.value.left,token.value.right,function(ctx,name){
                        return ctx[name];
                    });
                }
                runtime_error(token,error_types.unknown_operator);
            }else if((operator.attr & operator_attrs.calculator) || (operator.attr & operator_attrs.comparator)){
                return operator.binary_exec(this.exec_token(token.value.left),this.exec_token(token.value.right));
            }else{
                runtime_error(token,error_types.invalid_data_type);
            }
        },
        exec_ternary_expr: function(token)
        {
            return this.exec_token(token.value.left) ? this.exec_token(token.value.middle) : this.exec_token(token.value.right)
        },
        exec_data_element:function(token)
        {
            return this.exec_element_lookup(token.value.data,token.value.elements,function(ctx,index){
                return ctx[index];
            });
        },
        exec_call:function(token)
        {
            var func     = null;
            var func_ctx = null;

            if(token.value.data.type === token_types.identifier){
                func = this.exec_identifier(token.value.data);
            }else if(token.value.data.type === token_types.data_element){
                this.exec_element_lookup(token.value.data.value.data,token.value.data.value.elements,function(ctx,index){
                    func_ctx = ctx;
                    func     = ctx[index];
                });
            }else if(token.value.data.type === token_types.binary_expr){
                if(is_prop_accessor_operator(token.value.data.value.operator)){
                    this.exec_prop_lookup(token.value.data.value.left,token.value.data.value.right,function(ctx,name){
                        func_ctx = ctx;
                        func     = ctx[name];
                    });
                }
            }else{
                func = this.exec_token(token.value.data);
            }
            if(typeof(func) !== "function") {
                runtime_error(token,error_types.not_a_function);
            }
            var args = this.exec_array(token.value.args);

            if((args instanceof Array)){
                return func.apply(func_ctx || this.global_context,args);
            }
            runtime_error(token,error_types.invalid_arguments);
        },
        exec_sections:function(sections,tail_section)
        {
            for(var i=0;i<sections.length;++i)
            {
                this.exec_token(sections[i]);

                if(this.returned || this.looping === 3){
                    return;
                }else if(this.looping === 2){
                    break;
                }
            }
            if(tail_section)
            {
                if(tail_section instanceof Array){
                    for(var y=0;y<tail_section.length;++y){
                        this.exec_token(tail_section[y]);
                    }
                }else{
                    this.exec_token(tail_section);
                }
            }
        },
        exec_if_condition:function(token)
        {
            var body = token.value.body;

            if(this.exec_token(token.value.condition)){
                this.exec_sections(body);
            }else if(token.value.else_body){
                this.exec_sections(token.value.else_body);
            }
        },
        exec_for_loop:function(token)
        {
            var conditions = token.value.conditions;
            var body       = token.value.body;

            if(conditions[0].length > 0){
                for(var i=0;i<conditions[0].length;++i){
                    this.exec_token(conditions[0][i]);
                }
            }
            while(true)
            {
                for(var y=0;y<conditions[1].length;++y)
                {
                    var ret = this.exec_token(conditions[1][y]);

                    if(!ret){
                        this.looping = 0;
                        return;
                    }
                }
                if(!body){
                    continue;
                }
                this.looping = 1;
                this.exec_sections(body,conditions[2]);

                if(this.returned || this.looping === 3){
                    break;
                }
            }
            this.looping = 0;
        },
        exec_while_loop:function(token)
        {
            var conditions = token.value.conditions;
            var body       = token.value.body;

            while(true)
            {
                for(var y=0;y<conditions.length;++y)
                {
                    var ret = this.exec_token(conditions[y]);

                    if(!ret){
                        this.looping = 0;
                        return;
                    }
                }
                if(!body){
                    continue;
                }
                this.looping = 1;
                this.exec_sections(body);

                if(this.returned || this.looping === 3){
                    break;
                }
            }
            this.looping = 0;
        },
        exec_return_value:function(token)
        {
            this.result   = this.exec_token(token.value);
            this.returned = true;
        },
        exec_functor:function(token)
        {
            var that = this;
            var func = function()
            {
                var functor = new function_executor(token.sections,that,this,that.global_context);

                for(var i=0;i<token.params.length;++i){
                    functor.variable_map[token.params[i]] = arguments[i];
                }
                functor.exec(function(e)
                {

                });
                return functor.result;
            }
            if(token.name){
                this.variable_map[token.name] = func;
            }
            return func;
        },
        exec_typeof:function(token)
        {
            if(token.value instanceof Array){
                return typeof(this.exec_token(token.value[token.value.length - 1]));
            }
            return typeof(this.exec_token(token.value));
        },
        exec_token:function(token)
        {
            if(++this.exec_count >= TrashScript.config.max_exec_limit){
                runtime_error(token,error_types.max_exec_limit_exceeded);
            }
            switch(token.type)
            {
            case token_types.undefined:
            case token_types.number:
            case token_types.bool:
            case token_types.string:
                return token.value;
            case token_types.null_:
                return null;

            case token_types.identifier:
                return this.exec_identifier(token);

            case token_types.array:
                return this.exec_array(token);
            case token_types.args:
                return this.exec_args(token);
            case token_types.object:
                return this.exec_object(token);
            case token_types.unary_expr:
                return this.exec_unary_expr(token);
            case token_types.binary_expr:
                return this.exec_binary_expr(token);
            case token_types.ternary_expr:
                return this.exec_ternary_expr(token);
            case token_types.call:
                return this.exec_call(token);
            case token_types.data_element:
                return this.exec_data_element(token);

            case token_types.if_condition:
                return this.exec_if_condition(token);
            case token_types.for_loop:
                return this.exec_for_loop(token);
            case token_types.while_loop:
                return this.exec_while_loop(token);
            case token_types.return_value:
                return this.exec_return_value(token);
            case token_types.functor:
                return this.exec_functor(token);
            case token_types.break_loop:
                this.looping = 3;
                break;
            case token_types.continue_loop:
                this.looping = 2;
                break;
            case token_types.type_of:
                return this.exec_typeof(token);
            case token_types.this_obj:
                return this.context;
            }
            return undefined;
        },
        exec:function(callback)
        {
            this.callback = callback;
            this.exec_sections(this.sections);
            this.callback({status:"complete",result:this.result});
        }
    }


    ///--------------------------
    var executor  =
    {
        parsed: false,
        status: "none",
        callback: callback,
        sections: [],

        ///-----------------
        is_running:function(){
            return this.status === "running";
        },
        is_error:function(){
            return this.status === "error";
        },
        is_complete:function(){
            return this.status === "complete"
        },

        ///-----------------
        exec:function(context)
        {
            if(this.is_running() || this.is_error()){
                return false;
            }
            this.status = "running";

            try{
                if(!this.parsed){
                    this.sections = parse();
                    this.parsed = true;
                }
            }catch(e){
                this.status = "error";
                this.callback && this.callback({status:"error",error:e});
                return false;
            }

            try{
                (new function_executor(this.sections,null,context || this,context || this)).exec(function(e){
                    executor.status = e.status;
                    executor.callback && executor.callback(e);
                });
            }catch(e){
                executor.status = e;
                executor.callback && executor.callback({status:"error",error:e});
            }
            return true;
        }
    }
    return executor;
}


///-----------------------------
TrashScript.config     = {
    max_exec_limit:1000000
};
TrashScript.perperties = {};
TrashScript.bind       = function(name,value)
{
    if(typeof name === "object"){
        for(var key in name){
            TrashScript.bind(key,name[key]);
        }
    }else if(typeof name === "string")
    {
        if(typeof(Object.defineProperty) !== "function"){
            TrashScript.perperties[name] = value;
        }else{
            Object.defineProperty(TrashScript.perperties,name,{
                value: value,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
    }
    return TrashScript;
};