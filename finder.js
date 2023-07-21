const finderComponent = {
  props:['data','selectFunc', 'findParam'],
  setup(props){
    const text = ref('')
    const suggestions = ref([])

    const showText = () => {
      props.data.forEach((plot) => {
        if(plot[props.findParam].includes(text.value)){
          suggestions.value.push({plotname:plot.plotname, plotid: plot.plotid})
        }
      })
    }

    const inputHandler = (event) => {
      text.value = event.target.value
    }

    const selectHandler = (id) => {
      props.selectFunc(id)
      suggestions.value = []
      text.value = ''
    }

    return{
      showText,
      inputHandler,
      suggestions,
      selectHandler,
      text,
    }
  },
  template:`
    <div class="operators">
      <input type="search" :value="text" @input="inputHandler">
      <button @click="showText">
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>
    </div>
    <ul class="suggestions">
      <li v-for="sug in suggestions">
        <button @click="selectHandler(sug.plotid)">
          <i class="fa-solid fa-map"></i>
          {{sug.plotname}}
        </button>
      </li>
    </ul>
  `
}



