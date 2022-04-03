<script>
	export let value = ''
    import Color from 'color'
</script>

<input 
    type="color" 
    bind:value 
    style={`border-color: ${Color(value).isDark() ? 'white' : 'black'}`}
/>

<style>
input[type="color"] {
   -webkit-appearance: none;
    width: 2.2rem;
    height: 2.2rem;
    border: 0;
    border-radius: 0.4rem;
    padding: 0;
    border: solid 2px;
    overflow: hidden;
    box-shadow: 2px 2px 5px rgba(0,0,0,.1);
}
input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}
input[type="color"]::-webkit-color-swatch {
    border: none;
}
</style>
