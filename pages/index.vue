<template>
  <div class="container pb-20">
    <Toast position="top-right" />
    <Dialog
      header="Finite Automata"
      :visible.sync="displayDialog"
      position="top"
      :containerStyle="{ width: '100vw' }"
    >
      <table class="table-auto w-full text-center">
        <tr>
          <th class="border-collapse border p-3 bg-blue-700 text-white">id</th>
          <th class="border-collapse border p-3">states</th>
          <th class="border-collapse border p-3">start state</th>
          <th class="border-collapse border p-3">final state</th>
          <th class="border-collapse border p-3">symbols</th>
          <th class="border-collapse border p-3">symbol</th>
          <th class="border-collapse border p-3">transaction</th>
          <th class="border-collapse border p-3">Epsilon</th>
          <th class="border-collapse border p-3">Action</th>
        </tr>
        <tr v-for="item in dataFromDatabases" :key="item.id">
          <td class="border-collapse border bg-blue-700 text-white">
            {{ item.id }}
          </td>
          <td class="border-collapse border">{{ item.number_of_state }}</td>
          <td class="border-collapse border">{{ item.start_state }}</td>
          <td class="border-collapse border">{{ item.final_state }}</td>
          <td class="border-collapse border">{{ item.number_of_symbol }}</td>
          <td class="border-collapse border">{{ item.symbol }}</td>
          <td class="border-collapse border w-96">{{ item.transaction }}</td>
          <td class="border-collapse border w-52">
            {{
              Object.keys(item.transaction_epsilon).length > 0
                ? item.transaction_epsilon
                : " "
            }}
          </td>
          <td class="border-collapse border">
            <div class="flex justify-evenly">
              <Button
                class="p-button p-button-sm"
                icon="pi pi-replay"
                label="Load"
                @click="loadFiniteAutomata(item)"
              >
              </Button>
              <Button
                class="p-button p-button-sm"
                icon="pi pi-pencil"
                @click="editFiniteAutomata(item)"
              >
              </Button>
              <Button
                class="p-button p-button-sm p-button-danger"
                icon="pi pi-trash"
                @click="deleteFiniteAutomata(item)"
              >
              </Button>
            </div>
          </td>
        </tr>
      </table>
    </Dialog>

    <div class="absolute top-2 right-2">
      <Button
        class="p-button p-button-sm"
        :disabled="EditingFA"
        @click="getListFromDatabases()"
      >
        List finite saved
      </Button>
      <Button
        type="button"
        class="p-button p-button-sm p-button-success"
        @click="saveToDatabase()"
        :disabled="EditingFA"
        icon="pi pi-save"
        label="Save to Database"
      ></Button>
      <Button
        :disabled="EditingFA"
        @click="clearForm()"
        class="p-button p-button-sm p-button-danger"
      >
        Clear Form
      </Button>
    </div>

    <div class="space-y-5 w-10/12 p-5">
      <div class="flex justify-start space-x-4">
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
                placeholder="Select state"
              />
            </div>
            <p v-if="!startState" class="text-red-500">
              Please select start state
            </p>
            <div class="flex items-center">
              <p class="whitespace-nowrap pr-2">Final state</p>
              <MultiSelect
                v-model="finalState"
                :options="statesOption"
                class="w-full py-0 items-center text-sm h-11 w-52"
                optionValue="name"
                optionLabel="name"
                placeholder="Select state"
                :show-toggle-all="false"
              />
            </div>
            <p v-if="finalState.length === 0" class="text-red-500">
              Please select final state
            </p>
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

      <div v-if="!loading" class="w-full flex justify-between space-x-10">
        <div>
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
                  <div
                    v-for="i in state"
                    :key="i.id"
                    class="flex justify-start"
                  >
                    <input-text
                      v-for="item in getTheTransaction(i - 1)"
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
          <div
            v-if="!EditingFA && !loading"
            class="flex flex-col mx-auto w-96 mt-10 space-y-5"
          >
            <div>
              <p>Process String</p>
              <div>
                <InputText type="text" v-model="stringProcess" class="h-10" />
                <Button
                  class="p-button p-button-sm"
                  @click="calculate()"
                  icon="pi pi-chevron-circle-right"
                  label="Process String"
                >
                </Button>
              </div>
            </div>
            <div class="space-x-2">
              <Button
                class="p-button p-button-sm"
                @click="Test_FA_is_DFA_or_NFA()"
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
        </div>
        <div>
          <div class="flex justify-end">
            <Button
              @click="showGraph = !showGraph"
              class="p-button-sm float-right"
              :class="showGraph ? 'p-button-danger' : ''"
              >{{ showGraph ? "Remove Graph" : "Generate Graph" }}
            </Button>
          </div>
          <graph
            v-if="showGraph"
            :startState="startState"
            :symbols="symbols"
            :epsilons="epsilons"
            :array="array"
            :states="state"
            :finalState="finalState"
          />
        </div>
      </div>
      <div v-else class="flex justify-center">
        <div>
          <ProgressSpinner
            style="width: 50px; height: 50px"
            strokeWidth="8"
            fill="#EEEEEE"
          />
          <p>waiting user input</p>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <Button
        v-if="EditingFA"
        class="p-button p-button-sm p-button-success"
        @click="saveToDatabase('update')"
        >Save Update
      </Button>
    </div>
    <div class="mt-10">
      <div v-if="convertFromNFAtoDFA">
        <h1 class="text-center text-5xl font-bold">
          Result for converting from NFA to DFA
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
import axios from "axios";
import result from "../components/result.vue";
import Graph from "../components/graph.vue";
export default {
  components: { result, Graph },
  name: "IndexPage",
  data() {
    return {
      dataFromDatabases: null,
      displayDialog: false,
      EditingFA: false,
      showGraph: false,
      IdTmpForUpdate: null,

      testFA: false,
      finiteAutomata: null,

      startState: null,
      finalState: [],
      symbol: null,

      useEpsilon: false,
      error: false,
      state: null,
      stringProcess: null,
      symbols: [],
      array: {},

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

      axios,
      // base url for api
      url: "http://127.0.0.1:8000/api",
    };
  },

  watch: {
    symbols() {
      // check if array have duplicate value
      let findDuplicates = (arr) =>
        arr.filter((item, index) => arr.indexOf(item) != index);
      // check if user input duplicate symbol
      let tmp = findDuplicates(this.symbols);
      if (tmp.length > 0) {
        this.error = true;
      } else {
        this.error = false;
      }
    },
  },

  computed: {
    // generate transaction
    statesOption() {
      const option = [];
      for (let i = 0; i < this.state; i++) {
        option.push({ name: `Q${i}` });
      }

      return option;
    },

    // waiting until have number of state && symbols
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
    async getListFromDatabases() {
      try {
        const { data } = await this.axios.get(`${this.url}/automata`);
        this.dataFromDatabases = data;

        this.displayDialog = !this.displayDialog;
      } catch (error) {
        console.log(error);
      }
    },

    async deleteFiniteAutomata(FA) {
      try {
        await this.axios.delete(`${this.url}/automata/${FA.id}`);
        const { data } = await this.axios.get(`${this.url}/automata`);
        this.dataFromDatabases = data;
      } catch (error) {
        console.log(error);
      }
    },

    clearForm() {
      this.state = null;
      this.startState = null;
      this.finalState = [];
      this.symbol = null;
      this.symbols = [];
      this.array = {};
      this.testFA = false;
      this.epsilons = {};
      this.finiteAutomata = null;
      this.stringProcess = null;
      this.results = [];
      this.stateMinimization = [];
      this.interaction = [];
      this.Iter2 = [];
      this.stateConvertNfa = null;
      this.arrayConvertNfa = {};
      this.finalStateConvertNfa = [];
      this.stateAfterMinimization = null;
      this.arrayAfterMinimization = {};
      this.finalStateAfterMinimization = [];
      this.convertFromNFAtoDFA = false;
      this.minimizationStatus = false;
    },

    loadFiniteAutomata(FA) {
      this.state = FA.number_of_state;
      this.startState = FA.start_state;
      this.finalState = FA.final_state;
      this.symbol = FA.number_of_symbol;
      this.symbols = FA.symbol;
      this.array = FA.transaction;
      this.epsilons = FA.transaction_epsilon;

      this.displayDialog = !this.displayDialog;

      if (Object.keys(this.epsilons).length > 0) {
        this.useEpsilon = true;
      }
    },

    editFiniteAutomata(FA) {
      this.IdTmpForUpdate = FA.id;

      this.state = FA.number_of_state;
      this.startState = FA.start_state;
      this.finalState = FA.final_state;
      this.symbol = FA.number_of_symbol;
      this.symbols = FA.symbol;
      this.array = FA.transaction;
      this.epsilons = FA.transaction_epsilon;

      this.displayDialog = !this.displayDialog;
      if (Object.keys(this.epsilons).length > 0) {
        this.useEpsilon = true;
      }
      this.EditingFA = true;
    },

    //save to database
    async saveToDatabase(status) {
      if (
        this.state &&
        this.symbols &&
        this.array &&
        this.symbol &&
        this.startState &&
        this.finalState
      ) {
        try {
          if (status === "update") {
            const { data } = await this.axios.put(
              `${this.url}/automata/${this.IdTmpForUpdate}`,
              {
                number_of_state: this.state,
                start_state: this.startState,
                final_state: this.finalState,
                number_of_symbol: this.symbol,
                symbol: this.symbols,
                transaction: this.array,
                transaction_epsilon: this.epsilons,
              }
            );
            if (data) {
              this.alertMessage(
                `successful update on id ${this.IdTmpForUpdate} `
              );
              this.EditingFA = false;
              this.state = null;
              this.startState = null;
              this.finalState = [];
              this.symbol = null;
              this.symbols = [];
              this.array = {};
            } else {
              this.alertMessage("Fail update", "error");
            }
          } else {
            const { data } = await this.axios.post(`${this.url}/automata`, {
              number_of_state: this.state,
              start_state: this.startState,
              final_state: this.finalState,
              number_of_symbol: this.symbol,
              symbol: this.symbols,
              transaction: this.array,
              transaction_epsilon: this.epsilons,
            });
            if (data) {
              this.alertMessage("successful save to databases");
            } else {
              this.alertMessage("Fail save to databases", "error");
            }
          }
        } catch (error) {
          console.log(error);
          this.alertMessage("Fail save to databases", "error");
        }
      } else {
        this.alertMessage(
          "can not save to database, please fill the input or select",
          "error"
        );
      }
    },
    // function for test if FA is DFA or NFA
    Test_FA_is_DFA_or_NFA() {
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

    // function for alert message
    alertMessage(message, status) {
      this.$toast.add({
        severity: status ? status : "success",
        summary: message,
        life: 3000,
      });
    },

    // function for calculate
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

    // function for minimization
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

      // console.log(Iter1);
      // copy array
      this.interaction = Iter1.slice();

      if (Iter1.length > 0) {
        this.getInteraction(ValueHalfTriangle);
        // console.log("this.Iter2");
      }
      this.interaction.sort();
      // console.log(this.interaction);

      let mini = this.getMinimizationStep3(
        this.interaction,
        arrayRow,
        arrayColumn
      );
      // console.log(mini);

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

      // get number of state
      const lengthOfState = Object.keys(transaction).length;

      this.stateAfterMinimization = lengthOfState;
      this.arrayAfterMinimization = result;
      this.finalStateAfterMinimization = tmpFinalState;

      this.minimizationStatus = true;
      this.convertFromNFAtoDFA = false;
    },

    // minimization step 3
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
        /// EX: Q0 and a => Q0a
        let sateTran = `${state}${this.symbols[i]}`;
        for (let item in this.array) {
          // EX: if = Q0a get value of Q0a = Q0
          if (item === sateTran) {
            // check if state already exist
            const check = this.stateMinimization.includes(this.array[item]);
            if (!check) {
              this.stateMinimization.push(this.array[item]);
              this.getMinimization(this.array[item]);
            }
          }
        }
      }
    },

    // function for get interaction
    getInteraction(ValueHalfTriangle) {
      let Iter2 = [];
      for (let k = 0; k < ValueHalfTriangle.length; k++) {
        // console.log(ValueHalfTriangle[k]);
        const checkValueNotInIter1 = false;
        for (let l = 0; l < this.interaction.length; l++) {
          // check if two array are the same
          if (
            JSON.stringify(this.interaction[l]) ===
            JSON.stringify(ValueHalfTriangle[k])
          ) {
            checkValueNotInIter1 = true;
          }
        }
        // if two array are not the same
        if (!checkValueNotInIter1) {
          for (let i = 0; i < this.symbols.length; i++) {
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
              // check if two array are the same
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
      // sort array
      tmpArr1.sort();
      tmpArr2.sort();
      // check if the same. EX: [1,2,3] === [1,2,3]
      if (JSON.stringify(tmpArr1) === JSON.stringify(tmpArr2)) {
        return true;
      }
      return false;
    },

    // function for help check to get only a half to triangle
    halfTriangle(string1, string2) {
      // EX: Q1 , Q2 or  Q1 and Q2
      let test = [string1, string2].sort();
      // after short ==  Q1 and Q2

      // if string2 == Q1 it false
      if (test[0] === string2) {
        return false;
      }
      return true;
    },

    //function for remove first or last value
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

    // function for calculate NFA
    calculateNFA(noCalculate) {
      console.log("N F A");
      // before calculate we have to convert it to DFA and calculate it on DFA
      // call function to convert from NFA to DFA and no need return
      this.convertNFAtoDFA([this.startState], false);
      let object = [];

      for (let i = 0; i < this.results.length; i++) {
        object[i] = this.convertNFAtoDFA(this.results[i], true);
      }
      //  object; /// [ [ [] ] ]

      // declare array for transaction
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

            // check if two array are the same
            if (
              JSON.stringify(this.results[state]) ===
              JSON.stringify(object[stateIndex][symbol])
            ) {
              // set value transaction
              array[`Q${stateIndex}${this.symbols[symbol]}`] = `Q${state}`;
            }
          }
        }
      }

      // if noCalculate == true it mean just want to convert from NFA to DFA
      if (noCalculate) {
        // set result
        this.stateConvertNfa = object.length;
        this.arrayConvertNfa = array;
        this.finalStateConvertNfa = finalStates;
        this.convertFromNFAtoDFA = true;
        this.minimizationStatus = false;
      } else {
        // if noCalculate == null ro false it mean calculate NFA
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
          // EX: stateTran =  Q0 and a => Q0a
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
          // if doesn't have transaction, EX: Q0->a and no state,
          // so just use the Epsilon,
          // and if Eps no state we also don't move the state
          if (!haveTran) {
            // stateTranTest = Q0 -> Eps = Q0Eap
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
            if (NewStates.length <= 0) {
              NewStates.push("EmptySet");
            }
          }
        } // for states [] array

        NewStates = this.getStateEps(NewStates);

        convertNFA.push(NewStates);
      } // for i

      // if getReturn == null || false
      if (!getReturn) {
        for (let index = 0; index < convertNFA.length; index++) {
          if (!this.checkIfAlreadyHave(this.results, convertNFA[index])) {
            this.results.push(convertNFA[index]);
            this.convertNFAtoDFA(convertNFA[index], false);
          }
        }
      } else {
        //  if getReturn == true || have value
        return convertNFA;
      }
    },

    // function for check if array(smallArray) in 2 dimension array(bigArray)
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

    // function for get the transaction for Epsilon
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
            if (tempState.length <= 0) {
              tempState.push("EmptySet");
            }
          }
        }
      }
      return tempState;
    },

    // function for calculate DFA
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
      //  call function to show the result
      this.showResult(state, valueFinalStates);
    },

    // function for show the result
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

    // function for get The Transaction, EX: Q0a, Q0b, Q0c
    getTheTransaction(index) {
      let num = [];
      for (let i = 0; i < this.symbols.length; i++) {
        // Q0 and a = Q0a
        num[i] = `Q${index}` + this.symbols[i];
      }
      return num;
    },

    // function for get The Transaction on Epsilon, EX: Q0Eps, Q0Eps, Q0Eps
    getEpsilon(index) {
      let num = [];
      // Q0 and Eps = Q0Eps
      num[0] = `Q${index}Eps`;
      return num;
    },

    // function for show Epsilons field input for user input
    showColumnEpsilons() {
      this.useEpsilon = !this.useEpsilon;
      if (!this.useEpsilon) {
        this.epsilons = {};
      }
    },
  },
};
</script>
