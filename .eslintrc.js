module.exports = {
  'root': true,
  'env': {
    'commonjs': true,
    'es6': true
  },
  'rules': {
    // recommended 规范中没有，但是使用可以减少错误或融于代码，且不能自动修复的
    'getter-return': 2,
    'no-await-in-loop': 2,
    'array-callback-return': 1,
    'default-case': 2,
    'no-return-assign': 2,
    'no-self-compare': 2,
    'no-useless-call': 2,
    'no-unused-expressions': 2,
    'no-shadow': 2,
    'no-use-before-define': 2,
    'no-duplicate-imports': 2,
    'eqeqeq': 2,
    'no-loop-func': 2, 
    'no-unmodified-loop-condition': 2, 
    'vars-on-top': 2,
    'no-debugger': process.env.NODE_ENV === 'production || ' ? 2 : 0,
    'no-multi-spaces': 1, // 不要有连续的空格
    'no-useless-return': 1, // 不要有非必要的返回
    'prefer-arrow-callback': 1, // 回调函数中优先使用箭头函数
    'prefer-destructuring': 1, // 优先使用数组和对象解构
    'prefer-rest-params': 1, // 使用剩余参数而不是 arguments
    'prefer-template': 1, // 使用模板字面量而非字符串连接
    'no-var': 1, // 使用 let 和 const
    'brace-style': 1, // 在代码块中使用一致的大括号风格
    'no-lonely-if': 1, // if 不能作为唯一的语句出现在 else 语句中
    'dot-location': [1, 'property'], // 强制在点号之前和之后一致的换行
    'arrow-spacing': [1, { 'before': true, 'after': true }], // 箭头函数的箭头前后使用一致的空格
    'object-shorthand': [1, 'always'], // 对象字面量中方法和属性使用简写语法
    'rest-spread-spacing': [1, 'never'],
    'array-bracket-spacing': [1, 'never'], 
    'comma-dangle': [1, 'never'],   
    'comma-spacing': [1, { 'before': false, 'after': true }], 
    'comma-style': [1, 'last'],
    'computed-property-spacing': [1, 'never'],
    'eol-last': [1, 'always'],
    'func-call-spacing': [1, 'never'],
    'function-paren-newline': [1, 'never'], 
    'indent': [1, 2],
    'key-spacing': [1, { 'beforeColon': false }],
    'keyword-spacing': [1, { 'before': true, 'after': true }],
    'new-cap': [1, { 'newIsCap': true}],
    'no-multiple-empty-lines': [1, { 'max': 1 }], 
    'no-whitespace-before-property': 2, 
    'quotes': [1, 'single'],
    'space-before-function-paren': [1, 'always'],
    'space-before-blocks': [1, 'always'],
    'semi': [1, 'never']
  }
}
