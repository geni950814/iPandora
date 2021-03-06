import sys
from antlr4 import *

from error.folTypeSyntaxErrorListener import folTypeSyntaxErrorListener
from folTypeLexer import folTypeLexer
from folTypeParser import folTypeParser
from folTypeVisitor import folTypeVisitor
from z3 import *

class Z3TypeBuilder(folTypeVisitor):

    def __init__(self, param_map, predicate_map):

        '''
            this is only for predicates not propositions as it is not necessary to declare propositions' types
        '''
        # from user's type to z3 type sort
        self.__type_map = dict()

        # from user's predicate type to z3 function
        self.predicate_map = predicate_map

        # predicate tuple's arguments' z3 type sorts
        self.param_map = param_map

    # Visit a parse tree produced by folTypeParser#init.
    def visitInit(self, ctx: folTypeParser.InitContext):
        #print("visitInit")
        for d in ctx.declaration():
            self.visit(d)
        for k, v in self.param_map.items():
            print("key and val")
            print(k, v)

    # Visit a parse tree produced by folTypeParser#declaration.
    def visitDeclaration(self, ctx: folTypeParser.DeclarationContext):
        #print("visitDeclaration")
        declaration = self.predicate_map.get(ctx.PREPOSITION().getText())
        if declaration is None:
            if ctx.predicateType():
                children = self.visit(ctx.predicateType())
                self.param_map[ctx.PREPOSITION().getText()] = children
                # append BoolSort() after putting in param_map
                children.append(BoolSort())
                # print(children)
                declaration = Function(ctx.PREPOSITION().getText(), *children)
            elif ctx.functionType():
                children = self.visit(ctx.functionType())
                self.param_map[ctx.PREPOSITION().getText()] = children
                declaration = Function(ctx.PREPOSITION().getText(), *children)
            self.predicate_map[ctx.PREPOSITION().getText()] = declaration
        return declaration

    # Visit a parse tree produced by folTypeParser#predicateType.
    def visitPredicateType(self, ctx: folTypeParser.PredicateTypeContext):
        print("visitPredicateType")
        return list(map((lambda s: self.visit(s)), ctx.sort()))

    # Visit a parse tree produced by folTypeParser#functionType.
    def visitFunctionType(self, ctx: folTypeParser.FunctionTypeContext):
        return list(map((lambda s: self.visit(s)), ctx.sort()))

    # Visit a parse tree produced by folTypeParser#sort.
    def visitSort(self, ctx: folTypeParser.SortContext):
        print("visitSort")
        if ctx.INT():
            return IntSort()
        elif ctx.BOOL():
            return BoolSort()
        else:
            type = self.__type_map.get(ctx.TYPE().getText()[1:])
            print(type)
            if type is None:
                blabla = ctx.TYPE().getText()[1:]
                print("We got blbafs")
                print(blabla)
                type = DeclareSort(blabla)
                print("DECLARED SORT")
                print(type)
                self.__type_map[ctx.TYPE().getText()[1:]] = type
            print("RETURNING")
            return type

    def visitInputArray(self, array):
        for i in array:
            input = InputStream(i)
            lexer = folTypeLexer(input)
            stream = CommonTokenStream(lexer)
            parser = folTypeParser(stream)
            errorListener = folTypeSyntaxErrorListener()
            parser.removeErrorListeners()
            parser.addErrorListener(errorListener)

            # Generate Parse tree and check for syntax errors
            tree = parser.init()
            if not errorListener.isGood():
                return False

            self.visit(tree)
        return True

    def visitInputFile(self, file):
        lexer = folTypeLexer(file)
        stream = CommonTokenStream(lexer)
        parser = folTypeParser(stream)

        tree = parser.init()
        self.visit(tree)

def main(argv):
    type_builder = Z3TypeBuilder(dict(), dict())
    type_builder.visitInputFile(FileStream(argv[1]))

if __name__ == '__main__':
    main(sys.argv)
