import { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#2594E1",
    colorTextBase: "#373737",
    colorError: "#F0507E",
    colorWarning: "#ffc041",
    colorSuccess: "#B0FFC8",
    fontFamily: "Kanit",
    fontSize: 16,
    fontWeightStrong: 400,
  },
  components: {
    Form: {
      verticalLabelPadding: 0,
      itemMarginBottom: 4,
    },
    Table: {
      cellFontSize: 16,
      headerBg: "#BDE2FF",
      rowHoverBg: "#F1F1F1",
      rowSelectedBg: "#F1F1F1",
      headerSplitColor: "#BDE2FF",
      headerBorderRadius: 0,
    },
  },
};
