<template>
  <div class="pb-10">
    <div class="flex flex-col items-center justify-center space-y-3 py-5">
      <p class="text-xl font-black">Start State : {{ startState }}</p>
      <p class="text-xl font-black">Final States : {{ finalState }}</p>
    </div>

    <div class="flex justify-center text-center">
      <div>
        <div class="border border-gray-600 h-10 p-2 py-1">States \ Symbols</div>
        <div
          v-for="index in states"
          :key="index.id"
          class="border border-gray-600 h-10 py-1"
        >
          Q<sub>{{ index - 1 }}</sub>
        </div>
      </div>
      <div>
        <div class="flex justify-start h-10">
          <p
            v-for="item in symbols"
            :key="item.id"
            class="border border-gray-600 w-20 py-1 bg-"
          >
            {{ item }}
          </p>
        </div>
        <div class="h-10">
          <div v-for="i in states" :key="i.id" class="flex justify-start">
            <p
              v-for="item in transaction(i - 1)"
              :key="item"
              class="w-full h-10 border border-black py-auto pt-1"
            >
              {{ array[item] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    array: {
      type: Object,
      required: true,
    },
    symbols: {
      type: Array,
      required: true,
    },
    startState: {
      // type: String,
      required: true,
    },
    states: {
      // type: Number,
      required: true,
    },
    finalState: {
      type: Array,
      required: true,
    },
  },

  methods: {
    transaction(index) {
      let num = [];
      for (let i = 0; i < this.symbols.length; i++) {
        num[i] = `Q${index}` + this.symbols[i];
      }
      return num;
    },
  },
};
</script>
