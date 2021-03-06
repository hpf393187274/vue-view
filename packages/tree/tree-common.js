
import Type from 'me-view/src/script/type'
import Tools from 'me-view/src/script/tools'
export default {
  data () {
    return {
      checkedAll: this.checked || (this.data && this.data.checked === true),
      checkedChildren: this.checked,
      accordionNode: null,
      checkedHalf: false,
      checkedNumber: 0,
      checkedHalfNumber: 0
    }
  },
  created () {
    this.listener('me-node-parent--node-accordion', target => {
      if (Tools.notEmpty(this.accordionNode) && this.accordionNode !== target) {
        this.accordionNode.setExpanded(false)
      }
      this.accordionNode = target
    })
  },
  computed: {
    children () {
      return this.level ? this.data.children : this.data
    },
    /** 是否存在孙子节点 */
    grandson__ () {
      return this.children.some(item => Tools.notBlank(item.children))
    }
  },
  methods: {
    setCheckedAll (value) {
      this.checkedAll = value
      this.checkedChildren = value
      this.checkedHalf = false
      this.statusHighlight = value
      this.checkedNumber = value ? this.nodeNumber : 0
      this.checkedHalfNumber = 0
    },
    isCheckedAll () {
      return this.checkedAll
    },
    isCheckedHalf () {
      return this.checkedHalf
    },
    isHazyChecked () {
      return this.checkedAll || this.checkedHalf
    },
    notHazyChecked () {
      return this.isHazyChecked() === false
    },
    isLeaf () { return this.nodeLeaf },
    isBranch () { return this.nodeBranch },
    /**
     * 获取 TreeNode
     * @param {Function} filter 过滤函数
     */
    findNode (filter) {
      if (Type.notFunction(filter)) { return }
      return this.getChildrenNodeList().find(node => filter(node.getData()))
    },
    findItem (value) {
      return this.data.find(item => this.uniqueValue(item) === value)
    },
    uniqueValue (data = {}) {
      if (Reflect.has(data, this.fieldValue) === false) {
        Reflect.set(data, this.fieldValue, Tools.UUId())
      }
      return Reflect.get(data, this.fieldValue)
    },
    /**
     * 获取默认过滤器
     * @param {*} value 比对值
     */
    defaultFilter (value) {
      if (Type.isObjectOrArray(value)) {
        return item => item[this.fieldValue] === value[this.fieldValue]
      }
      return item => item[this.fieldValue] === value
    },
    /**
     * 移除子节点
     *  @param {Object} data 要移除的节点
     */
    removeChildrenNode (node) {
      Tools.arrayRemove(this.children, this.defaultFilter(node.getData()))
    },
    /**
     * 获取子节点集合
     */
    getChildrenNodeList () {
      const children = this.$children
      if (Tools.isEmpty(children)) { return [] }
      return children.filter(item => item.$options.name === 'TreeNode')
    },
    /**
     * 获取子节点选中个数
     * 全选 and 半选
     */
    getCheckedNumber () {
      let checkedNumber = 0
      let checkedHalfNumber = 0
      for (const node of this.getChildrenNodeList()) {
        node.isCheckedAll() && checkedNumber++
        node.isCheckedHalf() && checkedHalfNumber++
      }
      this.checkedNumber = checkedNumber
      this.checkedHalfNumber = checkedHalfNumber
      return { checkedNumber, checkedHalfNumber }
    },
    handleClick (...param) {
      this.$emit('click', param)
    },
    /**
     * 处理：子节点通知
     */
    handlerChildrenNotification () {
      const { checkedNumber, checkedHalfNumber } = this.getCheckedNumber()
      if (this.checkedStrictly) {
        this.checkedAll = checkedNumber === this.nodeNumber
        if (checkedHalfNumber > 0) {
          this.checkedHalf = true
        } else {
          this.checkedHalf = checkedNumber > 0 && checkedNumber < this.nodeNumber
        }
      }
      if (this.$options.name === 'TreeNode') {
        this.dispatchParent('notification-parent')
      }
    },
    /**
     * 处理：点击节点选中
     * @param {Boolean} value 选中状态
     */
    handlerClickNode (value) {
      this.setCheckedAll(value)
      /** 复选框存在 And 严格选择 */
      if (this.checkbox === true && this.checkedStrictly === true) {
        /** 向下广播子集元素 */
        this.dispatch('broadcast-children', value)
        /** 向上通知父集元素 */
        this.dispatchParent('notification-parent')
      }
    },
    /**
     * 处理：点击节点选中
     * @param {Boolean} value 选中状态
     * @param {Boolean} deep 深度处理
     */
    handlerNodeCheck (value) {
      if (this.checkedStrictly === true && this.isBranch()) { return }
      this.setCheckedAll(value)
      if (this.checkbox === true && this.checkedStrictly === true) {
        this.dispatchParent('notification-parent')
      }
    },
    getCheckedChildren ({ leaf = true, tree = false, ...param } = {}) {
      const childrenList = []
      for (const node of this.getChildrenNodeList()) {
        if (node.isCheckedAll()) {
          childrenList.push(node.getData({ clone: false }))
          continue
        }
        if (node.isCheckedHalf()) {
          childrenList.push(node.getCheckedTreeData({ leaf, tree, ...param }))
        }
      }
      return childrenList
    },
    pushData (data) {
      if (Type.notArray(data) || Tools.isBlank(data)) { return }
      for (const item of [ ...data ]) {
        const node = this.findNode(this.defaultFilter(item))
        if (Tools.isEmpty(node)) {
          if (Tools.isEmpty(this.level)) {
            // TreeRoot
            this.data.push(item)
            continue
          }
          // TreeNode
          if (Tools.isEmpty(this.data.children)) {
            this.data.children = []
          }
          this.data.children.push(item)
          continue
        }
        if (Type.isArray(item.children) && item.children.length !== 0) {
          // 存在子节点
          node.pushData(item.children)
        }
      }
    }
  }
}
