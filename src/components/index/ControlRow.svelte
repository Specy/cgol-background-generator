<script>
    export let title = ''
</script>


<div class='row-wrapper'>
    <h1>{title}</h1>
    <div class="row">
        <slot></slot>
    </div>
</div>

<style>
    .row-wrapper{
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
        color: var(--controls-background-text);
    }
    .row{
        display: flex;
        margin: 1rem;
        gap: 0.8rem;
        flex-wrap: wrap;
        flex-direction: row;
    }
</style>