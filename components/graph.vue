<template>
  <div
    v-if="
      this.array &&
      this.symbols &&
      this.startState &&
      this.states &&
      this.finalState
    "
  >
    <p>State state : <span class="bg-yellow-500 text-white">orange</span></p>
    <p>
      Final state :
      <span class="bg-green-500 text-white">lightgreen</span>
    </p>
    <p>
      Start && Final :
      <span class="bg-pink-500 text-white">pink</span>
    </p>
    <div
      id="myDiagramDIV"
      class="item-center"
      style="width: 400px; height: 400px; border: solid 1px black"
    ></div>
  </div>
</template>

<script>
import * as go from "gojs";
const $ = go.GraphObject.make;
export default {
  data() {
    return {
      prepareTheSate: [],
      transition: [],
    };
  },
  props: {
    array: {
      type: Object,
      required: true,
    },
    epsilons: {
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

  mounted() {
    if (
      this.array &&
      this.symbols &&
      this.startState &&
      this.states &&
      this.finalState
    ) {
      this.init();
    }
  },

  methods: {
    init() {
      var $$ = go.GraphObject.make; // for conciseness in defining templates

      const myDiagram = $$(
        go.Diagram,
        "myDiagramDIV", // create a Diagram for the DIV HTML element
        {
          initialContentAlignment: go.Spot.Center, // center the content
          "undoManager.isEnabled": true, // enable undo & redo
        }
      );

      // define a simple Node template
      myDiagram.nodeTemplate = $$(
        go.Node,
        "Auto", // the Shape will go around the TextBlock
        $$(
          go.Shape,
          "Circle",
          {
            margin: 5,
          },
          // Shape.fill is bound to Node.data.color
          new go.Binding("fill", "color")
        ),
        $$(
          go.TextBlock,
          { margin: 3, maxSize: new go.Size(100, NaN) }, // some room around the text
          // TextBlock.text is bound to Node.data.key
          new go.Binding("text", "key")
        )
      );

      myDiagram.linkTemplate = $(
        go.Link, // the whole link panel
        $(
          go.Shape, // the link shape
          { stroke: "black" }
        ),
        $(
          go.Shape, // the arrowhead
          { toArrow: "standard", stroke: null }
        ),
        $(
          go.Panel,
          "Auto",
          $(
            go.Shape, // the label background, which becomes transparent around the edges
            {
              fill: $(go.Brush, "Radial", {
                0: "rgb(240, 240, 240)",
                0.3: "rgb(240, 240, 240)",
                1: "rgba(240, 240, 240, 0)",
              }),
              stroke: null,
            }
          ),
          $(
            go.TextBlock, // the label text
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#555555",
              margin: 4,
            },
            new go.Binding("text", "text")
          )
        )
      );
      // but use the default Link template, by not setting Diagram.linkTemplate
      // create the model data that will be represented by Nodes and Links

      // state = [Q0, Q1, Q2, Q3];
      const state = this.getState();
      state.map((item) =>
        this.prepareTheSate.push({
          key: item,
          color: this.getColor(item),
        })
      );

      this.transition = this.getTransition();
      // console.log("transition");
      // console.log(transition);
      // myDiagram.model = null;

      myDiagram.model = new go.GraphLinksModel(
        // [
        //   { key: "Q0", color: "orange" },
        //   { key: "Q1", color: "white" },
        //   { key: "Q2", color: "white" },
        //   { key: "Q4", color: "white" },
        //   { key: "Q5", color: "pink" },
        //   { key: "Q3", color: "lightgreen" },
        // ],
        this.prepareTheSate,
        this.transition
        // [
        //   { from: "Q0", to: "Q1", text: "a" },
        //   { from: "Q0", to: "Q2", text: "a" },
        //   { from: "Q1", to: "Q1", text: "a" },
        //   { from: "Q2", to: "Q3", text: "a" },
        //   { from: "Q2", to: "Q1", text: "a" },
        //   { from: "Q3", to: "Q0", text: "a" },
        // ]
      );
    },

    getState() {
      let data = [];
      for (let i = 0; i < this.states; i++) {
        data.push(`Q${i}`);
      }
      return data;
    },

    getTransition() {
      let states = this.getState();
      let data = [];
      for (let i = 0; i < states.length; i++) {
        let haveTran = false;
        for (let j = 0; j < this.symbols.length; j++) {
          // merge state and symbols
          // Q0 and a => Q0a
          let merge = `${states[i]}${this.symbols[j]}`;
          for (let stateValue in this.array) {
            if (stateValue === merge) {
              haveTran = true;
              if (this.array[stateValue].includes(",")) {
                let tmpState = this.array[stateValue].split(",");
                tmpState.map((item) =>
                  data.push({
                    from: states[i],
                    to: item,
                    text: this.symbols[j],
                  })
                );
              } else {
                data.push({
                  from: states[i],
                  to: this.array[stateValue],
                  text: this.symbols[j],
                });
              }
            }
          }
        }

        if (Object.keys(this.epsilons).length > 0) {
          let merge = `${states[i]}Eps`;
          console.log("merge");
          console.log(merge);
          for (let stateValue in this.epsilons) {
            if (stateValue === merge) {
              data.push({
                from: states[i],
                to: this.epsilons[stateValue],
                text: "Eps",
              });
            }
          }
        }
      }
      return data;
    },

    getColor(item) {
      if (item === this.startState && this.finalState.includes(item)) {
        return "pink";
      } else if (item === this.startState) {
        return "orange";
      } else if (this.finalState.includes(item)) {
        return "lightgreen";
      } else {
        return "white";
      }
    },
  },
};
</script>
