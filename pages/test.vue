<template>
  <div class="container">
    <p class="bg-green-500" v-if="finiteAutomata">
      This Finite Automata in {{ finiteAutomata }}
    </p>
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
              <p class="bg-green-500">
                Which one in start state {{ startState }}
              </p>
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
              <p v-if="startState === ''" class="bg-red-500">
                Please select start state
              </p>
            </div>
            <div>
              <p class="bg-green-500">
                Which one in final state
                {{ finalState.length > 0 ? finalState : "" }}
              </p>
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
              <p v-if="finalState.length === 0" class="text-red-500">
                Please select final state
              </p>
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
              <p v-if="useEpsilon" class="border border-gray-600 w-20 py-1">
                Epsilon
              </p>
              <Button
                class="p-button p-button-sm"
                :class="useEpsilon ? 'p-button-danger' : ''"
                @click="showColumnEpsilons()"
                >{{ !useEpsilon ? "Use " : "Remove " }}Epsilon( ε )</Button
              >
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
                <div v-if="useEpsilon">
                  <input-text
                    v-for="item in getEpsilon(i - 1)"
                    :key="item"
                    type="text"
                    :placeholder="item"
                    v-model="epsilons[item]"
                    class="h-10 w-20"
                  />
                </div>
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
              <Button class="p-button p-button-sm" @click="calculate()"
                >Result</Button
              >
            </div>
          </div>
        </div>
        <!-- result -->
        <div
          :class="{
            'bg-green-500': result === 'Accept',
            'bg-red-500': result === 'Reject',
          }"
        >
          {{ result || "" }}
        </div>
      </div>
      <div v-else class="mx-auto">
        <ProgressSpinner />
      </div>
      {{ array }}
      {{ epsilons }}
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      finiteAutomata: "",
      result: null,
      startState: "Q0",
      finalState: ["Q2"],
      symbol: 2,
      useEpsilon: false,
      error: false,
      state: 3,
      // stringCondition: "abb",
      stringProcess: null,
      symbols: ["a", "b"],
      array: {
        Q1c: "",
        Q0c: "Q1",
        Q1a: "Q2",
        Q2b: "Q3",
        // ///
        // Q00: "Q0",
        // Q01: "Q1",
        // Q10: "Q2",
        // Q11: "Q3",
        // Q21: "Q2",
        // Q20: "Q2",
        // Q30: "Q2",
        // Q31: "Q3",
        /////
        // Q0a: "Q0,Q1",
        // Q0b: "Q0",
        // Q1b: "Q2",
        // Q0a: "Q1",
        // Q0b: "Q0",
        // Q1a: "Q1",
        // Q1b: "Q2",
        // Q2b: "Q3",
        // Q2a: "Q1",
        // Q3a: "Q1",
        // Q3b: "Q0",
        ///////////
      },
      epsilons: {},
      TmpStateIndex: -1,
      storeTmpState: [],

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
      // End_with=abb NFA: {
      // Q0a: "Q0,Q1",
      // Q0b: "Q0",
      // Q1a: "",
      // Q1b: "Q2",
      // Q2b: "Q3",
      // Q2a: "",
      // Q3a: "",
      // Q3b: "",
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
      ) {
        this.TmpStateIndex = -1;
        this.storeTmpState = null;
        // check if FA is non-deterministic
        let NFA = Object.keys(this.array).find((key) =>
          this.array[key].includes(",")
        );
        // Test if a FA is deterministic or non-deterministic
        if (this.useEpsilon || NFA) {
          this.finiteAutomata = "Non-deterministic ( NFA )";
          this.calculateNFA();
        } else {
          this.finiteAutomata = "Deterministic ( DFA )";
          this.calculateDFA();
        }
      }
    },

    calculateNFA() {
      // console.log("N F A");
      let state = this.startState;
      let chIn = 0;
      // stringProcess = abbbaabababba
      for (let char of this.stringProcess) {
        // symbols = a,b
        for (let i = 0; i < this.symbols.length; i++) {
          // if char == char in symbol, EX: a === a,b
          if (char === this.symbols[i]) {
            // merge string : Q0 + a = Q0a
            let testStr = state + char;
            let sateHasTran2 = false;
            for (let stateValue in this.array) {
              // Q0a = Q0a ,value = Q0,Q1
              if (stateValue === testStr) {
                // move state to value = Q0,Q1
                // if state not null
                if (this.array[stateValue] !== "") {
                  sateHasTran2 = true;
                  if (this.array[stateValue].includes(",")) {
                    let tmpState = this.array[stateValue].split(",");
                    state = this.getOneState(chIn, state, tmpState);
                  } else {
                    state = this.array[stateValue];
                  }
                }
              }
            }

            if (!sateHasTran2) {
              state = this.getValueEpsilon(state);
            }
          }
        }
        chIn++;
      }

      this.showResult(state);
    },

    getOneState(chIn, state, tmpState) {
      // compare two array if that two array are the same
      if (JSON.stringify(tmpState) === JSON.stringify(this.storeTmpState)) {
        if (this.TmpStateIndex < tmpState.length - 1) {
          this.TmpStateIndex = this.TmpStateIndex + 1;
        }

        // else {
        //   this.TmpStateIndex = 0;
        // }
        return tmpState[this.TmpStateIndex];
      }
      this.storeTmpState = tmpState;
      let theState = state;

      for (let tmpStateValue in tmpState) {
        // if string nv sol can tv dol final state
        let storeStr = "";
        for (let k = chIn + 1; k < this.stringProcess.length; k++) {
          storeStr = storeStr + this.stringProcess[k];
        }

        // if string nv sol can tv dol final state
        // newTmpState = Q1
        let newTmpState = tmpState[tmpStateValue];
        // let newCharIndex = 0;

        for (let newChar of storeStr) {
          for (let x = 0; x < this.symbols.length; x++) {
            // if newChar == newChar in symbol
            if (newChar === this.symbols[x]) {
              // merge string
              // EX: Q1 + b = Q0b
              let newTestStr = newTmpState + newChar;
              let sateHasTran2 = false;

              // array = Q0a Q0b Q1a Q1b Q2b Q2a Q3a Q3b
              for (let newStateValue in this.array) {
                // if newTestStr (Q1b === Q1b)
                if (newStateValue === newTestStr) {
                  // set newTmpState = Q1b[value]
                  // if newTmpState not null
                  if (this.array[newStateValue] !== "") {
                    sateHasTran2 = true;
                    if (this.array[newStateValue].includes(",")) {
                      let tmpState2 = this.array[newStateValue].split(",");

                      newTmpState = this.getOneState(
                        chIn,
                        newTmpState,
                        tmpState2
                      );
                    } else {
                      newTmpState = this.array[newStateValue];
                    }
                  }
                }
              }
              if (!sateHasTran2) {
                newTmpState = this.getValueEpsilon(newTmpState);
              }
            }
          }
        }
        if (this.finalState.includes(newTmpState)) {
          theState = tmpState[tmpStateValue];
          //else if in Q0,Q1 have the same current state Q0
        } else if (tmpState[tmpStateValue] === state) {
          // set it = current state
          theState = tmpState[tmpStateValue];
        }
      }
      return theState;
    },

    getValueEpsilon(state) {
      let theState = state;
      let testStr = `${theState}Eps`;
      // Q0Eps, Q1Eps, Q2Eps, Q3Eps
      let sateHasTran = false;
      for (let stateValue in this.epsilons) {
        // Q0Eps == Q0Eps ,
        if (stateValue === testStr) {
          sateHasTran = true;
          // move state to value = Q0,Q1
          theState = this.epsilons[stateValue];
        }
      }
      if (!sateHasTran) {
        // this.showResult();
        theState = this.startState;
      }
      return theState;
    },

    calculateDFA() {
      // console.log("D F A");
      let state = this.startState;
      for (let char of this.stringProcess) {
        for (let i = 0; i < this.symbols.length; i++) {
          // if char == char in symbol
          if (char === this.symbols[i]) {
            // merge string
            // EX: Q0 + a = Q0a
            let testStr = state + char;
            for (let stateValue in this.array) {
              if (stateValue === testStr) {
                state = this.array[stateValue];
              }
            }
          }
        }
      }
      // .log(`nissssssssssss ${state}`);
      this.showResult(state);
    },

    showResult(state) {
      if (state) {
        console.log("showResult" + state);
        if (this.finalState.includes(state)) {
          this.result = "Accept";
        } else {
          this.result = "Reject";
        }
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

    getEpsilon(index) {
      let num = [];
      num[0] = `Q${index}Eps`;
      return num;
    },

    showColumnEpsilons() {
      this.useEpsilon = !this.useEpsilon;
      if (!this.useEpsilon) {
        this.epsilons = {};
      }
    },
  },
};
</script>
