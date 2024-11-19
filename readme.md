# Trash Script

A very tiny JS-like script interpreter implemented through JS.

Less than 10KB (gziped)

The primary purpose of TrashScript is to execute scripts in environments where ```eval``` and ```new Function``` are restricted, such as in browser extensions.

TrashScript was originally designed for modules in the
"[filecxx browser extension](https://github.com/filecxx/FileCentipede)" such as "Third-Party Query Interfaces," which can run custom scripts.

While not all JavaScript syntax has been implemented, the majority of commonly used syntax is available.

### Keywords:
How to allow eval in chrome extension



## Usage examples:

### Config
```
TrashScript.config = {
    max_exec_limit:1000000 //default
}
```

### Basic
```
var executor = TrashScript("Source code",function(e)
{
    if(e.status === "error"){
        console.log(e);
    }else if(e.status === "complete"){
        console.log(e.result);
    }
});
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
