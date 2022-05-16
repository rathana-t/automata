<template>
  <div class="container pb-20">
    <Toast position="top-right" />
    <div class="space-y-5 w-10/12 mx-auto">
      <div class="flex justify-evenly">
        <div class="space-y-4">
          <div>
            <p>Number of State</p>
            <InputNumber
              v-model="state"
              class="h-10 w-full"
              mode="decimal"
              showButtons
              :min="0"
              :max="100"
            />
          </div>
          <div v-if="state" class="space-y-2">
            <div class="flex items-center">
              <p class="whitespace-nowrap pr-2">Start state</p>
              <Dropdown
                v-model="startState"
                :options="statesOption"
                optionLabel="name"
                optionValue="name"
                class="w-full py-0 items-center text-sm h-11 w-52"
                placeholder="Select a City"
              />
              <p v-if="startState === ''" class="bg-red-500">
                Please select start state
              </p>
            </div>
            <div class="flex items-center">
              <p class="whitespace-nowrap pr-2">Final state</p>
              <MultiSelect
                v-model="finalState"
                :options="statesOption"
                class="w-full py-0 items-center text-sm h-11 w-52"
                optionValue="name"
                optionLabel="name"
                placeholder="Select a City"
                :show-toggle-all="false"
              />
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
            class="h-10 w-full"
            mode="decimal"
            showButtons
            :min="0"
            :max="100"
          />
          <div class="space-y-1 pt-1">
            <div
              v-for="index in symbol"
              :key="index.id"
              class="flex justify-around items-center whitespace-nowrap"
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

      <div v-if="!loading" class="w-full flex justify-center">
        <div>
          <Button
            class="p-button p-button-sm py-5"
            :class="useEpsilon ? 'p-button-danger' : ''"
            @click="showColumnEpsilons()"
            >{{ !useEpsilon ? "Use" : "Remove" }} Epsilon( ε )</Button
          >
          <div class="flex text-center">
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
                  class="border border-gray-600 w-20 py-1"
                >
                  {{ item }}
                </p>
                <p v-if="useEpsilon" class="border border-gray-600 w-20 py-1">
                  Epsilon
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
        </div>
      </div>
      <div v-else class="mx-auto">
        <ProgressSpinner />
      </div>
      <div class="flex flex-col mx-auto w-96 mt-10 space-y-5">
        <div>
          <p>Process String</p>
          <div>
            <InputText type="text" v-model="stringProcess" class="h-10" />
            <Button class="p-button p-button-sm" @click="calculate()"
              >Process String
            </Button>
          </div>
        </div>
        <div class="space-x-2">
          <Button class="p-button p-button-sm" @click="Test_FA_is_DFA_or_NFA()"
            >Test FA</Button
          >
          <Button
            v-if="testFA"
            :disabled="finiteAutomata === 'NFA'"
            class="p-button p-button-sm"
            @click="minimization()"
            >Minimization</Button
          >
          <Button
            v-if="testFA"
            :disabled="finiteAutomata === 'DFA'"
            class="p-button p-button-sm"
            @click="calculateNFA(true)"
            >Convert NFA to DFA
          </Button>
        </div>
      </div>
      <!-- {{ array }} -->
      <!-- {{ epsilons }} -->
      <!-- {{ results }} -->
      <!-- {{ stateMinimization }} -->
    </div>
    <div class="mt-10">
      <div v-if="convertFromNFAtoDFA">
        <h1 class="text-center text-5xl font-bold">
          Result for converting form NAF to DFA
        </h1>
        <result
          :startState="startState"
          :symbols="symbols"
          :array="arrayConvertNfa"
          :states="stateConvertNfa"
          :finalState="finalStateConvertNfa"
        />
      </div>
      <div v-if="minimizationStatus">
        <h1 class="text-center text-5xl font-bold">
          Result for Minimization DFA
        </h1>
        <result
          :startState="startState"
          :symbols="symbols"
          :array="arrayAfterMinimization"
          :states="stateAfterMinimization"
          :finalState="finalStateAfterMinimization"
        />
      </div>
    </div>
  </div>
</template>

<script>
import result from "../components/result.vue";
export default {
  components: { result },
  name: "IndexPage",
  data() {
    return {
      testFA: false,
      finiteAutomata: null,
      startState: "Q0",
      // finalState: ["Q4"],
      finalState: ["Q3"],
      // finalState: ["Q1"],
      // finalState: ["Q2"],
      // symbol: 2,
      symbol: 2,
      useEpsilon: false,
      error: false,
      // state: null,
      // state: 5,
      // state: 8,
      state: 4,
      // state: 3,
      stringProcess: null,
      // symbols: ["0", "1"],
      symbols: ["a", "b"],
      array: {
        // Q00: "Q1",
        // Q01: "Q3",
        // Q10: "Q2",
        // Q11: "Q4",
        // Q20: "Q1",
        // Q21: "Q4",
        // Q30: "Q2",
        // Q31: "Q4",
        // Q40: "Q4",
        // Q41: "Q4",

        Q0a: "Q0,Q1",
        Q0b: "Q0",
        Q1b: "Q2",
        Q2b: "Q3",
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

      convertFromNFAtoDFA: false,
      stateConvertNfa: null,
      arrayConvertNfa: {},
      finalStateConvertNfa: [],

      minimizationStatus: false,
      stateAfterMinimization: null,
      arrayAfterMinimization: {},
      finalStateAfterMinimization: [],
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
  },

  computed: {
    statesOption() {
      const option = [];
      for (let i = 0; i < this.state; i++) {
        option.push({ name: `Q${i}` });
      }

      return option;
    },

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
    Test_FA_is_DFA_or_NFA() {
      window.localStorage.setItem("name", "Obaseki Nosasasdj" + this.state);

      if (this.array && this.startState && this.finalState) {
        let NFA = Object.keys(this.array).find((key) =>
          this.array[key].includes(",")
        );
        // Test if a FA is deterministic or non-deterministic
        if (this.useEpsilon || NFA) {
          this.finiteAutomata = "NFA";
        } else {
          this.finiteAutomata = "DFA";
        }

        this.testFA = true;

        this.alertMessage(`This Finite Automata is ${this.finiteAutomata}`);
      }
    },

    alertMessage(message, status) {
      this.$toast.add({
        severity: status ? status : "success",
        summary: message,
        life: 3000,
      });
    },

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
          this.finiteAutomata = "NFA";
          this.calculateNFA();
        } else {
          this.finiteAutomata = "DFA";
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
      // console.log("ValueHalfTriangle");
      // console.log(ValueHalfTriangle);
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

      // console.log("Iter1");
      // console.log(Iter1);
      // copy array
      this.interaction = Iter1.slice();

      if (Iter1.length > 0) {
        this.getInteraction(ValueHalfTriangle);
        // console.log("this.Iter2");
      }
      this.interaction.sort();
      // console.log("this.interaction");
      // console.log(this.interaction);

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

      let tmpFinalState = [];
      for (let state in transaction) {
        for (let i = 0; i < this.finalState.length; i++) {
          if (transaction[state].includes(this.finalState[i])) {
            // check if the state already have
            if (!tmpFinalState.includes(state)) {
              tmpFinalState.push(state);
            }
          }
        }
      }

      console.log("transaction");
      console.log();
      console.log("result");
      console.log(result);
      console.log("tmpFinalState");
      console.log(tmpFinalState);

      // get number of state
      const lengthOfState = Object.keys(transaction).length;

      this.stateAfterMinimization = lengthOfState;
      this.arrayAfterMinimization = result;
      this.finalStateAfterMinimization = tmpFinalState;

      this.minimizationStatus = true;
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

    calculateNFA(noCalculate) {
      console.log("N F A");
      this.convertNFAtoDFA([this.startState], false);
      let object = [];
      for (let i = 0; i < this.results.length; i++) {
        object[i] = this.convertNFAtoDFA(this.results[i], true);
      }
      //  object; /// [ [ [] ] ]
      // console.log("object");
      // console.log(object);

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

      if (noCalculate) {
        this.stateConvertNfa = object.length;
        this.arrayConvertNfa = array;
        this.finalStateConvertNfa = finalStates;
        this.convertFromNFAtoDFA = true;
      } else {
        this.calculateDFA(array, finalStates);
      }
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
          this.alertMessage("Accept");
        } else {
          this.alertMessage("Reject", "error");
        }
      } else {
        this.alertMessage("Reject", "error");
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
