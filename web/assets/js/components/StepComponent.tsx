import * as classNames from "classnames";
import { assign } from "lodash";
import * as React from "react";

import { AnchorButton, Button, InputGroup, Intent, NumericInput, Position, Tag, Tooltip } from "@blueprintjs/core";

import { StepData } from "../actions/index";
import { createImplication } from "../model/logicFormulaCreators";
import { BoxButtonComponent } from "./BoxButtonComponent";
import { ForAllButtonComponent } from "./ForAllButtonComponent";

export interface StepComponentProps {
  boxId: string; // current box
  boxType: string; // current box
  depth: number;
  firstStepInBox: StepData;
  proofId: string;
  isFirstStepInBox: boolean; // current box
  lastStepInBox: StepData;
  inputType: string;
  givenIdList: number[]; // linenumber -> id
  stepIdList: number[];
  onAdd: (proofId: string,
          depth: number,
          text: string,
          givenJust: number[],
          stepJust: number[],
          boxId: string,
          isFirstStepInBox: boolean) => void;
  onDelete: (proofId: string, id: number, text: string, boxId: string, isFirstStepInBox: boolean) => void;
  onCreateBox: (proofId: string, boxId: string, type: string) => void;
  onEndBox: (proofId: string, depth: number, text: string, stepJust: number[], boxId: string) => void;
  onCreateForAllBox: (proofId: string,
                      depth: number,
                      boxId: string,
                      type: string,
                      variable: string,
                      constant: string) => void;
  onEndForAllBox: (proofId: string,
                   depth: number,
                   text: string,
                   boxId: string,
                   stepJust: number[]) => void;
  dataList: StepData[];
  error: string;
  getData: (proofId: string) => void;
}

export interface StepComponentState {
  currentGivenLine?: number;
  currentStepLine?: number;
  text: string;
  givenLines: number[];
  stepLines: number[];
}

export class StepComponent extends React.Component<StepComponentProps, StepComponentState> {
  constructor() {
    super();
    this.state = {
      currentGivenLine: undefined,
      givenLines: [],
      stepLines: [],
      text: "",
    };
  }

  componentDidMount() {
    this.props.getData(this.props.proofId);
  }

  render() {
    // TODO: We most likely want to make render a smaller method which requires less variables
    const {
      inputType,
      onCreateBox,
      onEndBox,
      onCreateForAllBox,
      onEndForAllBox,
      boxId,
      boxType,
      depth,
      firstStepInBox,
      isFirstStepInBox,
      lastStepInBox,
      proofId,
      stepIdList,
    } = this.props;
    const { text, currentStepLine, currentGivenLine, givenLines, stepLines } = this.state;

    return (
      <div>
        <InputGroup
          placeholder={"Enter " + inputType + "..."}
          value={text}
          onChange={this.onChange}
          rightElement={this.renderError()}
        />

        <div className="justification-group">
          <NumericInput
            placeholder="Given Line Numbers"
            value={currentGivenLine}
            intent={Intent.SUCCESS}
            onValueChange={this.onUpdateCurrentGivenLine}
          />
          <AnchorButton className="pt-minimal" iconName="add" onClick={this.onAddGivenJustification} />
        </div>
        {this.renderProofLines(givenLines, Intent.SUCCESS, this.createOnDeleteGivenJustificationHandler)}
        <div className="justification-group">
          <NumericInput
            placeholder="Step Line Numbers"
            value={currentStepLine}
            intent={Intent.WARNING}
            onValueChange={this.onUpdateCurrentStepLine}
          />
          <AnchorButton className="pt-minimal" iconName="add" onClick={this.onAddStepJustification} />
        </div>
        {this.renderProofLines(stepLines, Intent.WARNING, this.createOnDeleteStepJustificationHandler)}

        <Button
          iconName="add"
          text="ADD PROOF"
          intent={Intent.PRIMARY}
          onClick={this.onAddStep}
        />
        {this.renderDataList()}

        <BoxButtonComponent
          type="I"
          firstStepInBox={firstStepInBox}
          lastStepInBox={lastStepInBox}
          proofId={proofId}
          stepIdList={stepIdList}
          boxId={boxId}
          boxType={boxType}
          depth={depth}
          onCreateBox={onCreateBox}
          onEndBox={onEndBox}
          getText={this.getImpliesText}
          getJustifications={this.getImpliesJustifications}
        />

        <BoxButtonComponent
          type="E"
          firstStepInBox={firstStepInBox}
          lastStepInBox={lastStepInBox}
          proofId={proofId}
          stepIdList={stepIdList}
          boxId={boxId}
          boxType={boxType}
          depth={depth}
          onCreateBox={onCreateBox}
          onEndBox={onEndBox}
          getText={this.getExistsText}
          getJustifications={this.getExistsJustifications}
        />

        <ForAllButtonComponent
          firstStepInBox={firstStepInBox}
          lastStepInBox={lastStepInBox}
          proofId={proofId}
          boxId={boxId}
          boxType={boxType}
          depth={depth}
          onCreateForAllBox={onCreateForAllBox}
          onEndForAllBox={onEndForAllBox}
        />
      </div>
    );
  }

  private getIds = (lines: number[], ids: number[]) => {
    return lines.map(l => ids[l - 1]);
  }

  private onAddGivenJustification = () => {
    const { currentGivenLine } = this.state;

    this.setState(assign({}, this.state, {
      currentGivenLine: undefined,
      givenLines: [...this.state.givenLines, currentGivenLine],
    }));
  }

  private onAddStepJustification = () => {
    const { currentStepLine } = this.state;

    this.setState(assign({}, this.state, {
      currentStepLine: undefined,
      stepLines: [...this.state.stepLines, currentStepLine],
    }));
  }

  private createOnDeleteGivenJustificationHandler = (line: number) => () => {
    this.setState(assign({}, this.state, {givenLines: this.state.givenLines.filter(item => item !== line) }));
  }

  private createOnDeleteStepJustificationHandler = (line: number) => () => {
    this.setState(assign({}, this.state, { stepLines: this.state.stepLines.filter(item => item !== line )}));
  }

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const text = (event.target as HTMLInputElement).value;
    this.setState(assign({}, this.state, { text }));
  }

  private assTag = (flag: boolean) => {
    if (flag) {
      return (
        <Tag intent={Intent.DANGER} > ass </Tag>
      );
    }
  }

  private onUpdateCurrentGivenLine = (valueAsNumber: number) => {
    this.setState(assign({}, this.state, {
      currentGivenLine: valueAsNumber,
    }));
  }

  private onUpdateCurrentStepLine = (valueAsNumber: number) => {
    this.setState(assign({}, this.state, {
      currentStepLine: valueAsNumber,
    }));
  }

  private onAddStep = () => {
    const { depth, boxId, proofId, givenIdList, onAdd, stepIdList, isFirstStepInBox } = this.props;
    const { givenLines, stepLines, text } = this.state;

    this.setState( assign({}, this.state, { givenLines: [], stepLines: [] }) );
    const givenJust = this.getIds(givenLines, givenIdList);
    const stepJust = this.getIds(stepLines, stepIdList);
    onAdd(proofId, depth, text, givenJust, stepJust, boxId, isFirstStepInBox);
  }

  private renderError = () => {
    const { error } = this.props;

    return error && (
      <Tooltip
        content={error}
        position={Position.BOTTOM_RIGHT}
      >
        <span className="pt-icon pt-icon-error pt-intent-danger"/>
      </Tooltip>
    );
  }

  private renderDataList = () => {
    const { dataList, givenIdList, proofId, stepIdList } = this.props;

    let currentLineNumber = 0;
    return dataList.map((item: StepData) => {
      const classes = classNames({
        indented1: item.depth === 1,
        indented2: item.depth === 2,
        indented3: item.depth === 3,
        indented4: item.depth === 4,
        indented5: item.depth === 5,
      });
      return (
        <div key={currentLineNumber++} className="pt-card">
          <div className={classes}>
            [{currentLineNumber}] {item.text}
            {this.assTag(item.isFirstStepInBox)}
            {this.renderJustificationList(item.givenJust, givenIdList, Intent.SUCCESS)}
            {this.renderJustificationList(item.stepJust, stepIdList, Intent.WARNING)}
            <AnchorButton
              className="pt-minimal"
              iconName="delete"
              onClick={this.createOnDeleteStepHandler(proofId, item)}
            />
          </div>
        </div>
      );
    });
  }

  private renderProofLines = (lines: number[],
                              intent: Intent,
                              createOnDeleteHandler: (line: number) => (() => void)) =>
    lines.map(line => (<Tag key={line} intent={intent} onRemove={createOnDeleteHandler(line)}>{line}</Tag>))

  private renderJustificationList = (list: number[], idList: number[], intent: Intent) => {
    return list.map((n: number) => (
      <Tag key={n} intent={intent}>{idList.indexOf(n) + 1}</Tag>
    ));
  }

  private createOnDeleteStepHandler = (proofId: string, item: StepData) => () => {
    const { onDelete } = this.props;

    onDelete(proofId, item.id, item.text, item.boxId, item.isFirstStepInBox);
  }

  private getImpliesText = (premise: StepData, conclusion: StepData) =>
    createImplication(premise.text, conclusion.text)

  private getExistsText = (first: StepData, conclusion: StepData) => conclusion.text;

  private getImpliesJustifications = (ids: number[], premise: StepData, conclusion: StepData) =>
    [premise.id, conclusion.id]

  private getExistsJustifications = (ids: number[], first: StepData, conclusion: StepData) => {
    const firstStepId = first.id;
    const conclusionStepId = conclusion.id;
    return [ids[ids.indexOf(firstStepId) - 1], firstStepId, conclusionStepId];
  }
}
