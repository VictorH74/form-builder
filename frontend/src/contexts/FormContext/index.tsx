import React, { createContext, useState, useEffect } from "react"
import { CREATE_FORM_MUTATION, DELETE_FORM_MUTATION, FORMS_QUERY } from "./graphql_operators";
import { IFormProvider, IFormList, IAddForm } from "./types";
import { useManualQuery, useMutation } from 'graphql-hooks';
import {useAuth} from "@/hooks/UseAuth";

export const FormContext = createContext<IFormProvider | null>(null);

const FormProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const auth = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [formsQuery] = useManualQuery(FORMS_QUERY)
    const [createForm, { loading: creating }] = useMutation(CREATE_FORM_MUTATION)
    const [deleteMutation, { loading: deleting }] = useMutation(DELETE_FORM_MUTATION)
    const [formList, setFormList] = useState<IFormList[]>([])

    useEffect(() => {
        const fetchForms = async () => {
            const res = await formsQuery();

            if (res.error) {
                console.error("", res.error)
                setError(true)
                setLoading(false)
                return
            }

            setFormList(res.data.forms)
            setLoading(false)
        }
        if (auth?.user) fetchForms()
    }, [auth?.user])

    const addForm = async (form: IAddForm, callBack: () => void) => {
        console.log(form)
        const res = await createForm({
            variables: form
        })

        if (res.error?.graphQLErrors) {
            return alert(res.error.graphQLErrors[0].message)
        }
        
        setFormList(prev => [...prev, res.data.createForm.form])
        callBack()
    }

    const deleteForm = async (id: number) => {
        const res = await deleteMutation({ variables: { id } })

        if (res.error?.graphQLErrors) {
            return alert(res.error.graphQLErrors[0].message)
        }

        setFormList(prev => prev.filter(form => form.id !== id))
    }

    const providerValue: IFormProvider = {
        loading,
        creating,
        error,
        formList,
        addForm,
        deleteForm
    }

    return (
        <FormContext.Provider value={providerValue}>
            {children}
        </FormContext.Provider>
    )
}

export default FormProvider