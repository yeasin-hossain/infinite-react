```mermaid
graph TD;
    startEdit-->editable;
    editable--"yes"-->editable_yes;
    editable--"no"-->done;
    
    editable_yes--column.getValueToEdit--->editing_active

    
    editing_active--"stopEdit({ cancel })"-->cancel
    editing_active--"stopEdit({ reject })"-->reject
    editing_active--"stopEdit({ value? })"-->should_accept_edit

    cancel-->onEditCancelled
    reject-->onEditRejected
    onEditCancelled-->done

    should_accept_edit--yes-->value_accepted
    should_accept_edit--no-->onEditRejected
    value_accepted --"column.getValueToPersist(async)"--> persist_value
    persist_value--no--> default_persist
    persist_value--yes--> custom_persist
    

    default_persist-->onEditPersistSuccess
    custom_persist-->onEditPersistSuccess
    custom_persist-->onEditPersistError
    onEditPersistSuccess-->done
    onEditPersistError-->done
    onEditRejected-->done
    


    startEdit["API.startEdit({rowIndex, columnId})"]
    editable{"editable?(async)"}
        
    editing_active(["Editing active"])
    editable_yes(["Yes"])
    
    
    cancel("Cancel - value discarded")
    reject("Reject - value rejected with error")

    onEditCancelled["onEditCancelled()"]
    onEditRejected["onEditRejected()"]

    should_accept_edit{"shouldAcceptEdit?(async)"}
    value_accepted(["onEditAccepted()"])
    persist_value{"props.persistEdit defined?"}

    default_persist["dataSourceApi.updateData(...)"]
    custom_persist["props.persistEdit(...) async"]
    onEditPersistSuccess["onEditPersistSuccess()"]
    onEditPersistError["onEditPersistError()"] 
```