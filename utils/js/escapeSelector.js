/** 
 * jQuery static function extensions. 
 */  
   
jQuery.extend(jQuery, {  
  /** 
   * Escape all special jQuery CSS selector characters in *selector*. 
   * Useful when you have a class or id which contains special characters 
   * which you need to include in a selector. 
   */  
  escapeSelector: (function() {  
    var specials = [  
      '#', '&', '~', '=', '>',   
      "'", ':', '"', '!', ';', ','  
    ];  
    var regexSpecials = [  
      '.', '*', '+', '|', '[', ']', '(', ')', '/', '^', '$'  
    ];  
    var sRE = new RegExp(  
      '(' + specials.join('|') + '|\\' + regexSpecials.join('|\\') + ')', 'g'  
    );  
  
    return function(selector) {  
      return selector.replace(sRE, '\\$1');  
    }  
  })()  
});  
