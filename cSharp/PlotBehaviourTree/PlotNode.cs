using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace PlotBehaviourTree
{
  public abstract class PlotNode
  {
    public String Name;
    public abstract bool IsConditional();
    public abstract List<PlotNode> Children();

    public PlotNode(string name)
    {
      this.Name = name;
    }
  }
}

