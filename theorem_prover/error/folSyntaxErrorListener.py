from antlr4 import *
from sys import *

from folLexer import folLexer
from folParser import folParser
from antlr4.error.ErrorListener import ErrorListener

class folSyntaxErrorListener( ErrorListener ):

    def __init__(self):
        super(folSyntaxErrorListener, self).__init__()
        self.good = True

    def isGood(self):
        return self.good

    def syntaxError(self, recognizer, offendingSymbol, line, column, msg, e):
        #self.error.append("\nSYNTAX ERROR")
        #self.error.append("(" + str(line) + ":" + str(column) + ") " + str(msg))
        self.good = False

    def reportAmbiguity(self, recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs):
        pass

    def reportAttemptingFullContext(self, recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs):
        pass

    def reportContextSensitivity(self, recognizer, dfa, startIndex, stopIndex, prediction, configs):
        pass

if __name__ == "__main__":
    errorListener = folSyntaxErrorListener()
    lexer = folLexer(FileStream(argv[1]))
    # Add your error listener to the lexer if required
    lexer.removeErrorListeners()
    lexer.addErrorListener(errorListener)
    stream = CommonTokenStream(lexer)
    parser = folParser(stream)
    parser.addErrorListener(errorListener)
    tree = parser.step()
