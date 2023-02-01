import React, { useState, useCallback, ChangeEvent } from "react"
import { Backward, Container, NewForm, QuestionComponents, QuestionsContainer, TitleInput } from "./styles"
import { IAddForm, IQuestion } from "../../types"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MultipleChoice from "./components/MutipleChoice";
import FillBlank from "./components/FillBlank";
import useLanguage from "@/hooks/UseLanguage";

const AddForm = () => {
    const { language: lang } = useLanguage()
    const [formData, setFormData] = useState<IAddForm>({
        title: "Teste de programação básica",
        questions: [
            {
                questionNumber: 1,
                questionText: "Como se chama a área de programação voltada à Interface de Usuário (UI)?",
                type: "TX",
            },
            {
                questionNumber: 2,
                questionText: "Python é uma linguagem interpretada?",
                type: "MC",
                alternatives: [
                    { detail: "Sim", isCorrect: true },
                    { detail: "Não" },
                ]
            },
        ]
    })

    const updateFormData = (e: ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.currentTarget
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const addQuestion = useCallback(() => {
        let type = "TX"
        let keys = ["questionNumber", "questionText", "type", "alternatives"]

        let question: IQuestion = { questionNumber: 1, questionText: "", type: "" }

        keys.forEach(key => {
            if (key === "questionNumber") question[key] = formData.questions.length + 1
            if (key === "type") question[key] = type
            if (key === "alternatives" && type === "MC") question[key] = []
        })

        let prevQuestions = formData.questions
        setFormData(prev => ({ ...prev, questions: [...prevQuestions, question] }))
    }, [formData])

    const setQuestionText = useCallback((index: number, value: string) => {
        let question: IQuestion = { ...formData.questions[index], questionText: value }

        let questions = formData.questions.map((prevQuestion, i) => i === index ? question : prevQuestion)

        setFormData(prev => ({ ...prev, questions }))
    }, [formData])

    const setAlterDetail = useCallback((QuestionIndex: number, alternativeIndex: number, value: string) => {
        let question = formData.questions[QuestionIndex]

        if (!question.alternatives) return;

        question.alternatives = question.alternatives.map((alt, i) => i === alternativeIndex ? { ...alt, detail: value } : alt)

        let questions = formData.questions.map((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)

        setFormData(prev => ({ ...prev, questions }))
    }, [formData])

    const setCorrectAlternative = useCallback((QuestionIndex: number, alternativeIndex: number) => {
        let question = formData.questions[QuestionIndex]

        if (!question.alternatives) return;

        question.alternatives = question.alternatives.map((alt, i) => ({ ...alt, isCorrect: i === alternativeIndex }))

        let questions = formData.questions.map((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)

        setFormData(prev => ({ ...prev, questions }))
    }, [formData])

    const addAlternative = useCallback((index: number) => {
        let newQuestion = formData.questions[index]

        if (!newQuestion.alternatives) return;

        newQuestion.alternatives = [...newQuestion.alternatives, { detail: "New alternative" }]

        let questions = formData.questions.map((prevQuestion, i) => i === index ? newQuestion : prevQuestion)

        setFormData(prev => ({ ...prev, questions }))
    }, [formData])

    return (
        <Container>
            <Backward to="/my-forms" ><ArrowBackIcon sx={{ fontSize: 50 }} /></Backward>
            <QuestionComponents>
                Components
            </QuestionComponents>
            <NewForm>
                <TitleInput type="text" name="title" placeholder={lang === "en" ? "Title" : "Título"} onChange={updateFormData} value={formData.title} />
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
                    <button onClick={addQuestion}>{lang === "en" ? "Add question" : "Adicionar questão"}</button>
                </QuestionsContainer>
            </NewForm>
        </Container>
    )
}

export default AddForm