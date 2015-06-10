using System;
using System.Collections.Generic;
using System.Linq;

namespace PlotBehaviourTree
{
  public class SelectorWeightedRandomArrayNode : PlotNode
  {
    /// <summary>
    /// Here the sum of likelihoods must be one - don't cheat
    /// Example:
    /// Lazy around .7
    /// Pretend to work .2
    /// Actually work .1
    /// </summary>
    private Dictionary<PlotNode, float> actionArrayAndLikelihood;

    public SelectorWeightedRandomArrayNode(Dictionary<PlotNode, float> actionArrayAndLikelihood)
    {
      this.actionArrayAndLikelihood = actionArrayAndLikelihood;
    }

    public ExecutionResult Execute(PlotManager plotManager)
    {
      var state = plotManager.NodeAndState[this];

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      if (state == PlotManager.NodeState.STATE_COMPUTE_RESULT)
      {
        PlotNode picked = ChooseByRandom(actionArrayAndLikelihood);

        plotManager.NodeAndState[this] = PlotManager.NodeState.STATE_WAITING;
        plotManager.NodeAndState[picked] = PlotManager.NodeState.STATE_TO_BE_STARTED;

        foreach (var item in actionArrayAndLikelihood)
        {
          if (item.Key != picked)
            plotManager.NodeAndState[item.Key] = PlotManager.NodeState.STATE_DISCARDED;
        }
      }
      return new ExecutionResult(true);
    }


    public bool IsConditional()
    {
      return true;
    }

    public List<PlotNode> Children()
    {
      return actionArrayAndLikelihood.Keys.ToList();
    }

    /// <summary>
    /// From http://stackoverflow.com/questions/3655430/selection-based-on-percentage-weighting
    /// </summary>
    private static Random random = new Random();

    public static PlotNode ChooseByRandom(
      Dictionary<PlotNode, float> collection)
    {
      var rnd = random.NextDouble();
      foreach (var item in collection)
      {
        if (rnd < item.Value)
          return item.Key;
        rnd -= item.Value;
      }
      throw new InvalidOperationException(
        "The proportions in the collection do not add up to 1.");
    }

  }
}