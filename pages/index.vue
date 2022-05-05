<template>
  <div class="container">
    <div class="space-y-5 w-10/12 mx-auto">
      <div class="flex justify-evenly">
        <div class="space-y-4">
          <div>
            <p>Number of State</p>
            <InputNumber
              v-model="state"
              class="h-10"
              mode="decimal"
              showButtons
              :min="0"
              :max="100"
            />
          </div>
          <div v-if="state" class="space-y-2">
            <div>
              <p>Which one in state state</p>
              {{ startState }}
              <select
                v-model="startState"
                class="
                  form-select
                  appearance-none
                  block
                  w-full
                  px-3
                  py-1.5
                  text-base
                  font-normal
                  text-gray-700
                  bg-white bg-clip-padding bg-no-repeat
                  border border-solid border-gray-300
                  rounded
                  transition
                  ease-in-out
                  m-0
                  focus:text-gray-700
                  focus:bg-white
                  focus:border-blue-600
                  focus:outline-none
                "
              >
                <option
                  v-for="item of state"
                  :key="item.id"
                  :value="`Q${item - 1}`"
                >
                  Q{{ item - 1 }}
                </option>
              </select>
            </div>
            <div>
              <p>Which one in final state</p>
              {{ finalState }}
              <select
                v-model="finalState"
                multiple
                class="
                  form-select
                  appearance-none
                  block
                  w-full
                  px-3
                  py-1.5
                  text-base
                  font-normal
                  text-gray-700
                  bg-white bg-clip-padding bg-no-repeat
                  border border-solid border-gray-300
                  rounded
                  transition
                  ease-in-out
                  m-0
                  focus:text-gray-700
                  focus:bg-white
                  focus:border-blue-600
                  focus:outline-none
                "
              >
                <option
                  v-for="item of state"
                  :key="item.id"
                  :value="`Q${item - 1}`"
                >
                  Q{{ item - 1 }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <p>Number of Symbols</p>
          <InputNumber
            v-model="symbol"
            class="h-10"
            mode="decimal"
            showButtons
            :min="0"
            :max="100"
          />
          <div class="space-y-2">
            <div
              v-for="index in symbol"
              :key="index.id"
              class="flex justify-around whitespace-nowrap"
            >
              <p>Symbols {{ index }}</p>
              <InputText
                type="text"
                v-model="symbols[index - 1]"
                class="h-10 w-32"
              />
            </div>
            <div v-if="error">
              <p class="text-red-500">The symbol must not the same</p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!loading">
        <div class="flex justify-center text-center">
          <div>
            <div class="border border-gray-600 h-10 p-2 py-1">
              States \ Symbols
            </div>
            <div
              v-for="index in state"
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
              <div v-for="i in state" :key="i.id" class="flex justify-start">
                <input-text
                  v-for="item in testSymbol(i - 1)"
                  :key="item"
                  type="text"
                  :placeholder="item"
                  v-model="array[item]"
                  class="h-10 w-20"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-10">
          <div>
            <p>Process String</p>
            <div>
              <InputText
                type="text"
                v-model="stringProcess"
                @keyup="calculate()"
                class="h-10"
              />
              <pv-button class="p-button p-button-sm" @click="calculate()"
                >Result</pv-button
              >
            </div>
          </div>
        </div>
        <!-- result -->
        <div>
          <h3>*DFA</h3>
          <div>{{ result || "" }}</div>
        </div>
      </div>
      <div v-else class="mx-auto">
        <ProgressSpinner />
      </div>
      {{ array }}
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      result: null,
      startState: "Q0",
      finalState: [],
      symbol: 2,
      error: false,
      state: 4,
      // stringCondition: "abb",
      stringProcess: null,
      symbols: ["a", "b"],
      array: {
        Q0a: "Q1",
        Q0b: "Q0",
        Q1a: "Q1",
        Q1b: "Q2",
        Q2b: "Q3",
        Q2a: "Q1",
        Q3a: "Q1",
        Q3b: "Q0",
      },
      // End_with=abb: {
      //   Q0a: "Q1",
      //   Q0b: "Q0",
      //   Q1a: "Q1",
      //   Q1b: "Q2",
      //   Q2b: "Q3",
      //   Q2a: "Q1",
      //   Q3a: "Q1",
      //   Q3b: "Q0",
      // },
      // 2ndLast=0: {
      //   Q0a: "Q1",
      //   Q0b: "Q0",
      //   Q1a: "Q1",
      //   Q1b: "Q2",
      //   Q2b: "Q3",
      //   Q2a: "Q1",
      //   Q3a: "Q1",
      //   Q3b: "Q0",
      // },

      // condition: "End_with",
      // conditions: [
      //   { name: "Start with", value: "Start_with" },
      //   { name: "End with", value: "End_with" },
      //   { name: "Contain", value: "Contain" },
      //   { name: "Start & End the same", value: "Start_End_the_same" },
      //   { name: "Start & End different", value: "Start_End_different" },
      // ],
    };
  },
  watch: {
    symbols() {
      // check if array have duplicate value
      let findDuplicates = (arr) =>
        arr.filter((item, index) => arr.indexOf(item) != index);
      let tmp = findDuplicates(this.symbols);
      if (tmp.length > 0) {
        this.error = true;
      } else {
        this.error = false;
      }
    },
    symbol() {
      // Clear all symbols when number of symbol chang
      this.symbols = [];
    },
  },
  computed: {
    // stateSymbol() {
    //   let num = [];
    //   let a = 0;

    //   let tmp = this.state * this.symbol;
    //   for (let j = 0; j < this.state; j++) {
    //     for (let i = 0; i < this.symbols.length; i++) {
    //       if (a < tmp) {
    //         num[a] = `Q${j}->` + this.symbols[i];
    //       }
    //       a++;
    //     }
    //   }
    //   return num;
    // },

    loading() {
      if (this.error) {
        return true;
      }
      let length = 0;
      if (this.state && this.symbol) {
        for (let index in this.symbols) {
          if (this.symbols[index] !== "") {
            length++;
          }
        }
        if (length === this.symbol) return false;
      }
      return true;
    },
  },
  methods: {
    calculate() {
      if (
        this.array &&
        this.stringProcess &&
        this.startState &&
        this.finalState
        // && this.condition
      ) {
        let state = this.startState;
        // if (this.condition === "End_with") {
        let charIndex = 0;
        for (let char of this.stringProcess) {
          for (let i = 0; i < this.symbols.length; i++) {
            // if char == char in symbol
            if (char === this.symbols[i]) {
              // merge string
              let testStr = state + char;
              for (let stateValue in this.array) {
                if (stateValue === testStr) {
                  state = this.array[stateValue];
                  // console.log(
                  //   stateValue + " = and = " + testStr + " ==== " + state
                  // );

                  // let storeStr = "";
                  // for (
                  //   let k = charIndex;
                  //   k < this.stringProcess.length;
                  //   k++
                  // ) {
                  //   storeStr = storeStr + this.stringProcess[k];
                  // }

                  // if (storeStr === this.stringCondition) {
                  //   // move state
                  //   state = this.array[stateValue];
                  // }
                }
              }
            }
          }
          charIndex++;
        }
        // console.log(`nissssssssssss ${state}`);
        this.showResult(state);
        // }
      }
    },

    showResult(state) {
      if (this.finalState.includes(state)) {
        this.result = "Accept";
      } else {
        this.result = "Reject";
      }
    },
    testSymbol(index) {
      let num = [];
      for (let i = 0; i < this.symbols.length; i++) {
        num[i] = `Q${index}` + this.symbols[i];
      }
      return num;
    },
  },
};
</script>
