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
              <Button class="p-button p-button-sm" @click="minimization()"
                >minimization</Button
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
      --sssssssssssss--
      {{ results }}
      <!-- =kk= -->
      {{ stateMinimization }}
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      finiteAutomata: null,
      result: null,
      startState: "Q0",
      finalState: ["Q4"],
      // finalState: ["Q2"],
      // symbol: 2,
      symbol: 2,
      useEpsilon: false,
      error: false,
      // state: null,
      // state: 8,
      state: 5,
      stringProcess: null,
      symbols: ["0", "1"],
      // symbols: ["a", "b"],
      array: {
        Q00: "Q1",
        Q01: "Q3",
        Q10: "Q2",
        Q11: "Q4",
        Q20: "Q1",
        Q21: "Q4",
        Q30: "Q2",
        Q31: "Q4",
        Q40: "Q4",
        Q41: "Q4",
      },
      // array: {
      //   Q0a: "Q1",
      //   Q0b: "Q5",

      //   Q1a: "Q6",
      //   Q1b: "Q2",

      //   Q2a: "Q0",
      //   Q2b: "Q2",

      //   Q3a: "Q2",
      //   Q3b: "Q6",

      //   Q4a: "Q7",
      //   Q4b: "Q5",

      //   Q5a: "Q2",
      //   Q5b: "Q6",

      //   Q6a: "Q6",
      //   Q6b: "Q4",

      //   Q7a: "Q6",
      //   Q7b: "Q2",
      // },
      // array: { Q00: "Q0", Q01: "Q2", Q21: "Q2,Q1" },
      // array: { Q0a: "Q0", Q0b: "Q0,Q1", Q2b: "Q3", Q2a: "Q3" },
      // epsilons: { Q1Eps: "Q2" },
      epsilons: {},
      results: [],
      stateMinimization: [],
      interaction: [],
      Iter2: [],
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
    // symbol() {
    //   // Clear all symbols when number of symbol chang
    //   this.symbols = [];
    // },
  },
  computed: {
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

    minimization() {
      let state = this.startState;
      this.stateMinimization.push(state);
      this.getMinimization(state); // result Q0, Q1

      this.stateMinimization.sort();

      let arrayRow = this.removeIndexInArray(this.stateMinimization, "first");
      let arrayColumn = this.removeIndexInArray(this.stateMinimization, "last");
      // console.log("arrayRow");
      // console.log("arrayColumn");
      let ValueHalfTriangle = [];

      for (let i = 0; i < arrayColumn.length; i++) {
        for (let j = 0; j < arrayRow.length; j++) {
          let tmpState = [];

          const check = this.halfTriangle(arrayColumn[i], arrayRow[j]);
          if (check) {
            tmpState.push(arrayColumn[i]);
            tmpState.push(arrayRow[j]);
            ValueHalfTriangle.push(tmpState);
          }
        }
      }
      console.log("ValueHalfTriangle");
      console.log(ValueHalfTriangle);
      const Iter1 = [];
      for (let k = 0; k < ValueHalfTriangle.length; k++) {
        // console.log("ValueHalfTriangle[k]");
        for (let i = 0; i < ValueHalfTriangle[k].length; i++) {
          const haveFinalState = this.finalState.includes(
            ValueHalfTriangle[k][i]
          );
          // if have final state
          if (haveFinalState) {
            Iter1.push(ValueHalfTriangle[k]);
          }
        }
      }

      console.log("Iter1");
      console.log(Iter1);
      this.interaction = Iter1.slice();

      if (Iter1.length > 0) {
        this.getInteraction(ValueHalfTriangle);
        // console.log("this.Iter2");
      }
      this.interaction.sort();
      console.log("this.interaction");
      console.log(this.interaction);

      let mini = this.getMinimizationStep3(
        this.interaction,
        arrayRow,
        arrayColumn
      );
      console.log("mini");
      console.log(mini);

      this.getResultOfMinimization(mini);
    },

    getResultOfMinimization(transaction) {
      let result = {};
      for (let state in transaction) {
        for (let i = 0; i < this.symbols.length; i++) {
          // tran = Q0 + a = Q0a
          let tran = `${transaction[state][0]}${this.symbols[i]}`;
          for (let stateValue in this.array) {
            if (stateValue === tran) {
              for (let tmpState in transaction) {
                // if [Q0, Q1 ,Q2] have Q1
                if (transaction[tmpState].includes(this.array[stateValue])) {
                  result[`${state}${this.symbols[i]}`] = tmpState;
                }
              }
            }
          }
        }
      }
      console.log(result);
    },

    getMinimizationStep3(interaction, arrayRow, arrayColumn) {
      // console.log(interaction);
      let transaction = {};
      let index = -1;

      let stateForCheck = [];
      let allValueState = [];
      for (let i = 0; i < arrayColumn.length; i++) {
        let k = 0;
        let newState = [];

        for (let j = 0; j < arrayRow.length; j++) {
          let valueState = [];
          k++;
          const check = this.halfTriangle(arrayColumn[i], arrayRow[j]);
          if (check) {
            valueState.push(arrayColumn[i]);
            valueState.push(arrayRow[j]);
          }
          if (valueState.length > 0) {
            // console.log(valueState);
            let checkIfSame = this.checkIfAlreadyHave(interaction, valueState);

            if (!checkIfSame) {
              stateForCheck.push(arrayColumn[i]);
              valueState.map((item) => {
                if (!newState.includes(item)) {
                  if (!allValueState.includes(item)) {
                    newState.push(item);
                    allValueState.push(item);
                  }
                }
              });
            }

            if (k == arrayRow.length) {
              if (!stateForCheck.includes(arrayColumn[i])) {
                if (!allValueState.includes(arrayColumn[i])) {
                  allValueState.push(arrayColumn[i]);
                  newState.push(arrayColumn[i]);
                }
              }
            }

            if (newState.length > 0 && k == arrayRow.length) {
              index++;
              transaction[`Q${index}`] = newState;
            }
          }
        }
      }

      let newNewState = [];
      let tmpIndex = 0;
      for (let i = 0; i < arrayColumn.length; i++) {
        tmpIndex++;
        let newOneState = [arrayColumn[i], arrayRow.at(-1)];
        let checkIfHave = this.checkIfAlreadyHave(interaction, newOneState);

        if (!checkIfHave) {
          stateForCheck.push(arrayRow.at(-1));
          newOneState.map((item) => {
            if (!newNewState.includes(item)) {
              if (!allValueState.includes(item)) {
                newNewState.push(item);
                allValueState.push(item);
              }
            }
          });
        }

        if (tmpIndex == arrayColumn.length) {
          if (!stateForCheck.includes(arrayRow.at(-1))) {
            if (!allValueState.includes(arrayRow.at(-1))) {
              allValueState.push(arrayRow.at(-1));
              newNewState.push(arrayRow.at(-1));
            }
          }
        }

        if (newNewState.length > 0 && tmpIndex == arrayColumn.length) {
          index++;
          transaction[`Q${index}`] = newNewState;
        }
      }

      return transaction;
    },

    getInteraction(ValueHalfTriangle) {
      let Iter2 = [];
      for (let k = 0; k < ValueHalfTriangle.length; k++) {
        // console.log("ValueHalfTriangle[k]");
        // console.log(ValueHalfTriangle[k]);
        const checkValueNotInIter1 = false;
        for (let l = 0; l < this.interaction.length; l++) {
          if (
            JSON.stringify(this.interaction[l]) ===
            JSON.stringify(ValueHalfTriangle[k])
          ) {
            checkValueNotInIter1 = true;
          }
        }
        if (!checkValueNotInIter1) {
          for (let i = 0; i < this.symbols.length; i++) {
            // merge string
            let teatStates = [];
            for (let j = 0; j < ValueHalfTriangle[k].length; j++) {
              let stateTran = ValueHalfTriangle[k][j] + this.symbols[i];
              // EX: Q0 + a = Q0a
              for (let stateValue in this.array) {
                if (stateValue === stateTran) {
                  teatStates.push(this.array[stateValue]);
                }
              }
            }

            for (let l = 0; l < this.interaction.length; l++) {
              const checking = this.getCheckArray(
                this.interaction[l],
                teatStates
              );
              if (checking) {
                const IfSame = this.checkIfAlreadyHave(
                  Iter2,
                  ValueHalfTriangle[k]
                );
                if (!IfSame) {
                  Iter2.push(ValueHalfTriangle[k]);
                }
              }
            }
          }
        }
      }

      Iter2.map((item) => this.interaction.push(item));

      if (Iter2.length > 0) {
        for (let i = 0; i < Iter2.length; i++) {
          this.Iter2.push(Iter2[i]);
        }
        this.getInteraction(ValueHalfTriangle);
      }
    },

    getCheckArray(array1, array2) {
      // copy array
      let tmpArr1 = array1.slice();
      let tmpArr2 = array2.slice();
      tmpArr1.sort();
      tmpArr2.sort();
      if (JSON.stringify(tmpArr1) === JSON.stringify(tmpArr2)) {
        return true;
      }
      return false;
    },

    halfTriangle(string1, string2) {
      let test = [string1, string2].sort();
      // console.log("string1, string2");
      // console.log("test sort");

      if (test[0] === string2) {
        return false;
      }
      return true;
    },

    removeIndexInArray(arr, indexRemove) {
      // copy array
      let tmpArr = arr.slice();
      // remove value by index
      if (indexRemove === "first") {
        tmpArr.shift();
        return tmpArr;
      } else {
        tmpArr.pop();
        return tmpArr;
      }
    },

    getMinimization(state) {
      for (let i = 0; i < this.symbols.length; i++) {
        let sateTran = `${state}${this.symbols[i]}`; /// EX: Q0a , Q0b
        for (let item in this.array) {
          // EX: if = Q0a get value of Q0a = Q0
          if (item === sateTran) {
            const check = this.stateMinimization.includes(this.array[item]);
            if (!check) {
              this.stateMinimization.push(this.array[item]);
              this.getMinimization(this.array[item]);
            }
          }
        }
      }
    },

    calculateNFA() {
      console.log("N F A");
      this.convertNFAtoDFA([this.startState], false);
      let object = [];
      for (let i = 0; i < this.results.length; i++) {
        object[i] = this.convertNFAtoDFA(this.results[i], true);
      }
      //  object; /// [ [ [] ] ]
      console.log("object");
      console.log(object);

      let array = {};
      let finalStates = [];
      for (let stateIndex = 0; stateIndex < object.length; stateIndex++) {
        for (let symbol = 0; symbol < object[stateIndex].length; symbol++) {
          // console.log(object[stateIndex][symbol]);

          for (let state = 0; state < this.results.length; state++) {
            for (let index = 0; index < this.finalState.length; index++) {
              // console.log(this.finalState[index]);
              if (this.results[state].includes(this.finalState[index])) {
                const check = finalStates.includes(`Q${state}`);
                if (!check) {
                  finalStates.push(`Q${state}`);
                }
              }
            }

            if (
              JSON.stringify(this.results[state]) ===
              JSON.stringify(object[stateIndex][symbol])
            ) {
              // set value transaction
              array[`Q${stateIndex}${this.symbols[symbol]}`] = `Q${state}`;
            }
          }
        }
        // array[] = object[stateIndex];
      }

      this.calculateDFA(array, finalStates);
    },

    convertNFAtoDFA(states, getReturn) {
      // states type array
      let convertNFA = [];
      let theState = states;
      // a , b
      for (let i = 0; i < this.symbols.length; i++) {
        let NewStates = [];
        // { Q0 , Q1 }
        // a
        for (let j = 0; j < theState.length; j++) {
          let stateTran = `${theState[j]}${this.symbols[i]}`;

          // theState = [ Q0 , Q1 , Q2 ]
          // EX: stateTran => Q0 + a =>  Q0a
          let haveTran = false;
          for (let item in this.array) {
            //  if Q0a = Q0a
            if (stateTran === item) {
              // if stateTran === item => it haveTranSaction
              haveTran = true;
              // check if it have already EmptySet, just remove it
              if (NewStates.find((item) => item === "EmptySet")) {
                var index = NewStates.indexOf("EmptySet");
                if (index !== -1) {
                  NewStates.splice(index, 1);
                }
              }
              //  if it doesn't have EmptySet, just push the state
              if (this.array[item].includes(",")) {
                let tmpState = this.array[item].split(",");
                tmpState.map((item) => NewStates.push(item));
              } else {
                NewStates.push(this.array[item]);
              }
              // if item === stateTran
            }
          } // for item

          if (!haveTran) {
            let stateTranTest = `${theState[j]}Eps`;
            //  epsilons = [ Q0Eps , Q1Eps , Q2Eps ]
            for (let item in this.epsilons) {
              // Q0Eps === Q0Eps
              if (stateTranTest === item) {
                if (NewStates.find((item) => item === "EmptySet")) {
                  var index = NewStates.indexOf("EmptySet");
                  if (index !== -1) {
                    NewStates.splice(index, 1);
                  }
                }
                NewStates.push(this.epsilons[item]);
              }
            }

            if (!NewStates.find((item) => item === "EmptySet")) {
              if (!NewStates.length > 0) {
                NewStates.push("EmptySet");
              }
            }
          }
        } // for states [] array

        NewStates = this.getStateEps(NewStates);
        const check = this.checkIfAlreadyHave(convertNFA, NewStates);
        if (!check) {
          // NewStates = [ Q0 , Q1 , Q2 ]
          convertNFA.push(NewStates);
        }
      } // for i

      if (!getReturn) {
        for (let index = 0; index < convertNFA.length; index++) {
          if (!this.checkIfAlreadyHave(this.results, convertNFA[index])) {
            this.results.push(convertNFA[index]);
            this.convertNFAtoDFA(convertNFA[index], false);
          }
        }
      } else {
        return convertNFA;
      }
    },

    checkIfAlreadyHave(bigArray, smallArray) {
      let tmpBigArr = bigArray.slice();
      let tmpSmallArr = smallArray.slice();
      tmpBigArr.sort();
      tmpSmallArr.sort();
      for (let index = 0; index < tmpBigArr.length; index++) {
        if (JSON.stringify(tmpSmallArr) === JSON.stringify(tmpBigArr[index])) {
          return true;
        }
      }
      return false;
    },

    getStateEps(NewStates) {
      // tempState = [ Q0 , Q1 , Q2 , Q3 ]
      let tempState = [];
      for (let i = 0; i < NewStates.length; i++) {
        if (!tempState.find((item) => item === NewStates[i])) {
          tempState.push(NewStates[i]);
        }
        // tranEps = Q0 + Eps = Q0Eps
        let tranEps = `${NewStates[i]}Eps`;
        let sateHasTran = false;
        //  epsilons = [ Q0Eps , Q1Eps , Q2Eps ]
        for (let item in this.epsilons) {
          // Q0Eps === Q0Eps
          if (tranEps === item) {
            sateHasTran = true;
            if (tempState.find((item) => item === "EmptySet")) {
              var index = tempState.indexOf("EmptySet");
              if (index !== -1) {
                tempState.splice(index, 1);
              }
            }
            // tempState add Q0Eps => value : Q0
            tempState.push(this.epsilons[item]);
          }
        }

        if (!sateHasTran) {
          if (!tempState.find((item) => item === "EmptySet")) {
            if (!tempState.length > 0) {
              tempState.push("EmptySet");
            }
          }
        }
      }
      return tempState;
    },

    calculateDFA(array, finalStates) {
      let valueArray = array || this.array;
      let valueFinalStates = finalStates || this.finalStates;
      // console.log("D F A");
      let state = this.startState;
      for (let char of this.stringProcess) {
        for (let i = 0; i < this.symbols.length; i++) {
          // if char == char in symbol
          if (char === this.symbols[i]) {
            // merge string
            // EX: Q0 + a = Q0a
            let testStr = state + char;
            for (let stateValue in valueArray) {
              // for (let stateValue in this.array) {
              if (stateValue === testStr) {
                state = valueArray[stateValue];
                // state = this.array[stateValue];
              }
            }
          }
        }
      }
      this.showResult(state, valueFinalStates);
    },

    showResult(state, valueFinalStates) {
      let finalState = valueFinalStates || this.finalState;
      if (state) {
        console.log("showResult" + state);
        // if (this.finalState.includes(state)) {
        if (finalState.includes(state)) {
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
