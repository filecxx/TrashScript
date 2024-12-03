# Trash Script

TrashScript interpreter.


The primary purpose of TrashScript is to execute scripts in environments where ```eval``` and ```new Function``` are restricted, such as in browser extensions.

TrashScript was originally designed for modules in the
[filecxx browser extension](https://github.com/filecxx/FileCentipede) such as [Third-Party Query Interfaces](https://github.com/filecxx/FileCentipede/wiki/Third%E2%80%90party-query-interfaces) which can run custom scripts.

While not all JavaScript syntax has been implemented, the most commonly used syntax is available.


## Asynchronous to synchronous
TrashScript does not provide any asynchronous interfaces and does not recommend using any callback-based asynchronous execution. 

Instead of setTimeout, the trashscript_lib.js offers a sleep function. 

Additionally, all asynchronous functions bound with ```TrashScript.bind``` will be converted to synchronous execution.

#### Example function:
```
var test = async function(val)
{
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve(val)
        },1000);
    });
}
TrashScript.bind("test",test); //bind the test function
```

#### in javascript
```
var ret = await test(111);
console.log(ret)
```

#### in trashscript
```
var ret = test(111); //no await
console.log(ret)
```

#### in javascript
```
var count = 0;
var func  = function()
{
    setTimeout(function(){
        if(count < 5){
            alert(count++);
            func();
        }
    },1000)
}
func();
```

#### in trashscript
```
for(i=0;i<5;++i){
    sleep(1000);
    alert(i);
}
```


## Usage examples:

### Config
```
TrashScript.config = {
    max_exec_limit:10000000 //default
}
```

### Basic
```
var executor = TrashScript("return 123",function(e)
{
    if(e.status === "error"){
        console.log(e);
    }else if(e.status === "complete"){
        console.log(e.result); //123
    }
});
executor.variables({global_var1:123}); //add global variables
executor.exec();
```

### Bind existing JavaScript functions or objects
```
TrashScript.bind("alert",function(arg){
    window.alert(arg);
});
```
```
TrashScript.bind({
    console:console,
    test:function(){},
    print:console.log,
    alert:alert,
    JSON:JSON
});
```

### Context object for 'this'
```
var executor = TrashScript("function aaa(){alert(this)};return aaa()",function(e){...});
executor.exec(window); //'this' is window
```
```
var executor = TrashScript("function aaa(){alert(this)};return aaa()",function(e){...});
executor.exec({}); //'this' is an empty object
```
