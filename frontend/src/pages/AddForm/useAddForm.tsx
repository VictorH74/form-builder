import React, { useState, useCallback, ChangeEvent, } from "react"
import { DropTargetMonitor, useDrop } from "react-dnd";
import useTranslate from "@/hooks/UseTranslate";
import { useNavigate } from 'react-router-dom';
import { IAddForm, IQuestion } from "@/contexts/FormContext/types";
import useForm from "@/hooks/UseForm";
import { TRANSLATION_DATA } from "./data";

interface DragItem {
    type: string
}

export default function useAddForm(form: IAddForm | undefined) {
    const navigate = useNavigate()
    const { addForm, creating } = useForm()

    const [openQuestionTypes, setOpenQuestionTypes] = React.useState(true);
    const [openQuestionSettings, setOpenQuestionSettings] = React.useState(false);
    const [openAlternativeSettings, setOpenAlternativeSettings] = React.useState(false);

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

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const debouncedFunction = React.useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const debounce = (func: () => void) => {
        if (debouncedFunction.current) {
            clearTimeout(debouncedFunction.current);
        }
        debouncedFunction.current = setTimeout(func, 300);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenQuestionTypesClick = () => {
        setOpenQuestionTypes(!openQuestionTypes);
    };
    
    const handleOpenQuestionSettingsClick = () => {
        setOpenQuestionSettings(!openQuestionSettings);
    };

    const handleOpenAlternativeSettings = () => {
        setOpenAlternativeSettings(!openAlternativeSettings);
    };

    const addQuestion = (type: string) => {
        let keys = ["questionNumber", "questionText", "type", "alternatives"]
        let questionNumber = formData.questions.length + 1
        let question: IQuestion = { questionNumber: questionNumber, questionText: translate("questionText", questionNumber), type: "" }

        keys.forEach(key => {
            if (key === "type") question[key] = type
            else if (key === "alternatives") {
                const alternatives: { detail: string, isCorrect?: boolean }[] = [
                    { detail: "Alternative 1" },
                    { detail: "Alternative 2" },
                ]
                if (type === "MC") alternatives[0].isCorrect = true;
                question[key] = alternatives
            }
        })
        let prevQuestions = formData.questions
        setFormData(prev => ({ ...prev, questions: [...prevQuestions, question] }))
    }

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: ["TX", "MC", "MS"],
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

    const updateFormQuestions = (mapFunction: (prev: IQuestion, index?: number) => IQuestion) => {
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

    const setCorrectMCAlternative = useCallback((QuestionIndex: number, alternativeIndex: number) => {
        let question = formData.questions[QuestionIndex]
        if (!question.alternatives) return;

        question.alternatives = question.alternatives.map((alt, i) => ({ ...alt, isCorrect: i === alternativeIndex }))

        updateFormQuestions((prevQuestion, i) => i === QuestionIndex ? question : prevQuestion)
    }, [formData])

    const setCorrectMSAlternative = useCallback((QuestionIndex: number, alternativeIndex: number) => {
        let question = formData.questions[QuestionIndex]
        if (!question.alternatives) return;

        question.alternatives[alternativeIndex].isCorrect = !question.alternatives[alternativeIndex].isCorrect;

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

    return ({
        drop,
        handleSubmit,
        translate,
        backgroundColor,
        opacity,
        updateFormData,
        formData,
        setQuestionText,
        addAlternative,
        setAlterDetail,
        setCorrectMCAlternative,
        setCorrectMSAlternative,
        creating,
        openQuestionTypes,
        openQuestionSettings,
        openAlternativeSettings,
        handleOpenAlternativeSettings,
        handleOpenQuestionTypesClick,
        handleOpenQuestionSettingsClick,
        anchorEl,
        debounce,
        handleClose,
        handleMenu
    })
}