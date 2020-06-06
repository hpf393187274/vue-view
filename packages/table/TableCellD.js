
import TableCell from './TableCell.mixin'
import Type from 'me-view/src/script/type'
let idSeed = 1
export default {
  name: 'MeTableCellD',
  mixins: [ TableCell ],
  props: {
    data: { type: Object, default: () => ({}) },
    render: Function
  },
  created () {
    this.index__ = idSeed++
    this.id__ = `me-table-column_${this.index__}`
  },
  render (h) {
    if (this.$slots.default) {
      // 渲染：普通默认插槽
      return this.renderRoot(h, this.$slots.default)
    }
    const params = {
      data: this.data,
      value: this.fieldValue,
      indexRow: this.indexRow,
      indexCell: this.indexCell
    }
    // 渲染 extended
    if (Type.isFunction(this.extended)) {
      return this.renderRoot(h, [
        this.extended(params)
      ])
    }

    if (Type.isFunction(this.render)) {
      return this.renderRoot(h, [
        this.render(h, params)
      ])
    }

    return this.renderRoot(h, h('span', { class: 'cell-inner' }, [ this.fieldValue ]))
  },
  computed: {
    fieldValue () {
      return Reflect.get(this.data, this.field)
    }
  },
  methods: {
    renderRoot (h, children) {
      return h('td', { style: this.styles }, [
        h('div', {
          class: [
            'table-cell me-row me-cross-center',
            `me-main-${this.layout}`
          ],
          attr: {
            title: this.fieldValue
          }
        }, [ ...[ children ].flat() ])
      ])
    }
  }
}
