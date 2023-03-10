import React, { useState, useCallback, ChangeEvent, memo, useMemo, CSSProperties } from "react"
import { Container, QuestionComponents, QuestionsContainer, SubmitBtn, TitleInput } from "./styles"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MultipleChoice from "./components/MutipleChoice";
import FillBlank from "./components/FillBlank";
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import useTranslate from "@/hooks/UseTranslate";
import { useNavigate } from 'react-router-dom';
import { IAddForm, IQuestion } from "@/contexts/FormContext/types";
import useForm from "@/hooks/UseForm";
import { TRANSLATION_DATA } from "./data";
import { Backward } from "@/global/styles/globalStyles";


interface DragItem {
    type: string
}

interface AddFormProps {
    form?: IAddForm
}

const AddForm: React.FC<AddFormProps> = ({ form }) => {
    const navigate = useNavigate()
    const { addForm, creating } = useForm()

    const translate = useTranslate(TRANSLATION_DATA)

    const [formData, setFormData] = useState<IAddForm>(form || {
        title: translate("title"),
        questions: [
            {
                questionNumber: 1,
                questionText: translate("questionText", 1),
                type: "TX",
            },
        ]
    })

    const addQuestion = (type: string) => {
        let keys = ["questionNumber", "questionText", "type", "alternatives"]
        let questionNumber = formData.questions.length + 1
        let question: IQuestion = { questionNumber, questionText: translate("questionText", questionNumber), type: "" }

        keys.forEach(key => {
            if (key === "type") question[key] = type
            if (key === "alternatives" && type === "MC") question[key] = [
                { detail: "Alternative 1", isCorrect: true },
                { detail: "Alternative 2" },
            ]
        })
        let prevQuestions = formData.questions
        setFormData(prev => ({ ...prev, questions: [...prevQuestions, question] }))
    }

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: ["TX", "MC"],
            drop(_item: DragItem, monitor) {
                let type = String(monitor.getItemType())
                if (!type) return;
                addQuestion(type)
                return undefined
            },
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [addQuestion],
    )

    const updateFormData = (e: ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.currentTarget
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const updateFormQuestions = (mapFunction: (prev: IQuestion[], index?: number) => any) => {
        let questions = formData.questions.map(mapFunction)
        setFormData(prev => ({ ...prev, questions }))
    }

    const setQuestionText = useCallback((index: number, value: string) => {
        let question: IQuestion = { ...formData.questions[index], questionText: value }
        updateFormQuestions((prevQuestion, i) => i === index ? question : prevQuestion)
    }, [formData])

    const setAlterDetail = useCallback((QuestionIndex: number, alternativeIndex: number, value: string) => {
        let question = formData.questions[QuestionIndex]
        if (!question.alternatives) return;

        question.alternatives = question.alternatives.map((alt, i) => i === alternativeIndex ? { ...alt, detail: value } : alt)

        updateFormQuestions((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)
    }, [formData])

    const setCorrectAlternative = useCallback((QuestionIndex: number, alternativeIndex: number) => {
        let question = formData.questions[QuestionIndex]
        if (!question.alternatives) return;

        question.alternatives = question.alternatives.map((alt, i) => ({ ...alt, isCorrect: i === alternativeIndex }))

        updateFormQuestions((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)
    }, [formData])

    const addAlternative = useCallback((QuestionIndex: number) => {
        let question = formData.questions[QuestionIndex]
        if (!question.alternatives) return;

        question.alternatives = [...question.alternatives, { detail: translate("alterDetail") }]

        updateFormQuestions((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)
    }, [formData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        addForm(formData, () => navigate("../", { replace: true }))
    }

    const opacity = isOver ? 1 : 0.7
    const backgroundColor = canDrop ? "#6969694b" : "transparent"

    return (
        <Container>
            <Backward to="/my-forms" >
                <ArrowBackIcon sx={{ fontSize: 50, color: "dodgerblue" }} />
            </Backward>
            <QuestionComponents>
                <Question type="TX" >{translate("textQuestionComponent")}</Question>
                <Question type="MC" >{translate("multipleChoiceComponent")}</Question>
            </QuestionComponents>
            <form onSubmit={handleSubmit} ref={drop} style={{ backgroundColor, opacity }}>
                <div className="new-form">
                    <TitleInput
                        type="text"
                        name="title"
                        onChange={updateFormData}
                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                        value={formData.title}
                    />
                    <QuestionsContainer>
                        {
                            formData.questions.map((q, i) =>
                                q.type === "TX" ?
                                    (<FillBlank
                                        key={q.questionNumber}
                                        index={i}
                                        question={q}
                                        setQuestionText={setQuestionText}
                                    />)
                                    : q.type === "MC" ?
                                        (<MultipleChoice
                                            key={q.questionNumber}
                                            index={i}
                                            addAlternative={addAlternative}
                                            setCorrectAlternative={setCorrectAlternative}
                                            setQuestionText={setQuestionText}
                                            setAlterDetail={setAlterDetail}
                                            question={q}
                                        />)
                                        : "")
                        }
                    </QuestionsContainer>
                </div>
                <SubmitBtn children="Submit" disabled={creating} />
            </form>
        </Container>
    )
}

export default AddForm


interface QuestionProps {
    type: string
    onToggleForbidDrag?: () => void
    children?: React.ReactNode
}

const questionStyles: CSSProperties = {
    padding: '0.5rem',
    margin: '0.5rem',
    backgroundColor: "dodgerblue",
    borderRadius: 20,
    textAlign: "center",
    cursor: "move"
}

// Dragabble Component
const Question: React.FC<QuestionProps> = memo(function Question({
    type,
    children,
}) {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: type,
            collect: (monitor: DragSourceMonitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [type],
    )

    const containerStyle = useMemo(
        () => ({
            ...questionStyles,
            opacity: isDragging ? 0.4 : 1,
        }),
        [isDragging],
    )

    return (
        <div ref={drag} style={containerStyle} role="Question" >
            <p>{children}</p>
        </div>
    )
})