// packages/native-runtime/src/eslint/no-raw-pressable.ts

import { ESLintUtils, TSESLint, TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name: string) => `https://yombri.com/eslint-rules/${name}`
);

type Options = [];
type MessageIds = "noPressable" | "noTouchable";

const rule = createRule<Options, MessageIds>({
  name: "no-raw-pressable",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw Pressable/Touchable* usage. Use Yombri primitives instead.",
      url: "https://yombri.com/eslint-rules/no-raw-pressable"
    },
    schema: [],
    messages: {
      noPressable:
        "Do not use raw Pressable. Use Button/IconButton/ListItem from @yombri/native-runtime.",
      noTouchable:
        "Do not use raw TouchableOpacity/TouchableHighlight. Use Button/IconButton/ListItem from @yombri/native-runtime."
    }
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<MessageIds, Options>) {
    const banned = new Set(["Pressable", "TouchableOpacity", "TouchableHighlight"]);

    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        if (node.name.type !== "JSXIdentifier") return;

        const name = node.name.name;
        if (!banned.has(name)) return;

        context.report({
          node,
          messageId: name === "Pressable" ? "noPressable" : "noTouchable"
        });
      }
    };
  }
});

export default rule;
