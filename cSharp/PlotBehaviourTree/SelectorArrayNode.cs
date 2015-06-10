using System;
using System.Collections.Generic;
using System.Linq;

namespace PlotBehaviourTree
{
  public class SelectorArrayNode : PlotNode
  {
    private Func<PlotManager, ExecutionResult> conditionFunction;
    private PlotNode[] actionArray;

    public SelectorArrayNode(Func<PlotManager, ExecutionResult> conditionFunction,
      PlotNode[] actionArray)
    {
      this.conditionFunction = conditionFunction;
      this.actionArray = actionArray;
    }

    public ExecutionResult Execute(PlotManager plotManager)
    {
      var state = plotManager.NodeAndState[this];

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      int resultInt = conditionFunction(plotManager).IntegerResult;

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      for (var j = 0; j < actionArray.Count(); j++)
      {
        if (j == resultInt)
          plotManager.NodeAndState[actionArray[j]] = PlotManager.NodeState.STATE_TO_BE_STARTED;
        else
          plotManager.NodeAndState[actionArray[j]] = PlotManager.NodeState.STATE_DISCARDED;
      }

      return new ExecutionResult(resultInt);
    }

    public bool IsConditional()
    {
      return true;
    }

    public List<PlotNode> Children()
    {
      return actionArray.ToList();
    }
  }
}